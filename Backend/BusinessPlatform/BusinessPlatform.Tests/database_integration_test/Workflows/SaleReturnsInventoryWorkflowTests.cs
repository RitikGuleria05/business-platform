
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Enums;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

// Add your actual project namespaces:
// using BusinessPlatform.API;
// using BusinessPlatform.Domain.Entities;
// using BusinessPlatform.Domain.Enums;
// using BusinessPlatform.Infrastructure.Data;

public class SaleReturnsInventoryWorkflowTests
{
    private const string JwtKey =
        "IntegrationTestKey-AtLeast32CharactersLong!";

    private const string Endpoint = "/api/SaleReturns";

    // -------------------------------------------------------
    // TEST 1: Full product return
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithFullQuantity_ShouldRestoreInventory()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 5)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventory = await db.Inventories.FirstAsync();
        var saleReturn = await db.SaleReturns
            .Include(x => x.Items)
            .FirstAsync();

        Assert.Equal(55, inventory.QuantityInStock);
        Assert.Single(db.SaleReturns);
        Assert.Single(saleReturn.Items);
        Assert.Equal(5, saleReturn.Items.First().Quantity);
        Assert.Equal(750m, saleReturn.TotalAmount);
    }

    // -------------------------------------------------------
    // TEST 2: Partial product return
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithPartialQuantity_ShouldRestoreOnlyReturnedQuantity()
    {
        var setup = await SetupAsync(soldQuantity: 5);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 2)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventory = await db.Inventories.FirstAsync();

        Assert.Equal(52, inventory.QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 3: Multiple product return
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithMultipleProducts_ShouldRestoreEachInventory()
    {
        var setup = await SetupAsync(productCount: 2);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(
                setup.SaleId,
                (setup.ProductIds[0], 2),
                (setup.ProductIds[1], 3)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventories = await db.Inventories.ToListAsync();

        Assert.Equal(52, inventories.Single(
            x => x.ProductId == setup.ProductIds[0]).QuantityInStock);

        Assert.Equal(53, inventories.Single(
            x => x.ProductId == setup.ProductIds[1]).QuantityInStock);

        Assert.Equal(2, await db.SaleReturnItems.CountAsync());
    }

    // -------------------------------------------------------
    // TEST 4: Return more than originally sold
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithQuantityGreaterThanSold_ShouldRejectReturn()
    {
        var setup = await SetupAsync(soldQuantity: 5);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 6)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
        Assert.Equal(0, await db.SaleReturns.CountAsync());
    }

    // -------------------------------------------------------
    // TEST 5: Return more than remaining quantity
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_AfterPreviousReturn_ShouldRejectExcessQuantity()
    {
        var setup = await SetupAsync(soldQuantity: 5);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var firstResponse = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 3)));

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        var secondResponse = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 3)));

        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(53, (await db.Inventories.FirstAsync()).QuantityInStock);
        Assert.Equal(1, await db.SaleReturns.CountAsync());
    }

    // -------------------------------------------------------
    // TEST 6: Invalid sale ID
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithInvalidSaleId_ShouldReturnNotFound()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(Guid.NewGuid(), (setup.ProductIds[0], 1)));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.SaleReturns.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 7: Product not belonging to original sale
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithProductNotInSale_ShouldRejectReturn()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (Guid.NewGuid(), 1)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.SaleReturns.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 8: Zero return quantity
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithZeroQuantity_ShouldRejectReturn()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 0)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.SaleReturns.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 9: Negative return quantity
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WithNegativeQuantity_ShouldRejectReturn()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], -2)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.SaleReturns.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 10: Cancelled sale cannot be returned
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_ForCancelledSale_ShouldRejectReturn()
    {
        var setup = await SetupAsync(saleStatus: SaleStatus.Cancelled);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 1)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.SaleReturns.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 11: Refund uses original sale price
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_ShouldCalculateRefundUsingOriginalSalePrice()
    {
        var setup = await SetupAsync(
            soldQuantity: 5,
            originalSellingPrice: 150m);

        using var factory = setup.Factory;
        using var client = setup.Client;

        // Change current product price after the original sale.
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var product = await db.Products.FindAsync(setup.ProductIds[0]);

            product!.SellingPrice = 200m;
            await db.SaveChangesAsync();
        }

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(setup.SaleId, (setup.ProductIds[0], 2)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDb = verificationScope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var saleReturn = await verificationDb.SaleReturns.FirstAsync();

        // 2 returned units × original sale price 150.
        Assert.Equal(300m, saleReturn.TotalAmount);
    }

    // -------------------------------------------------------
    // TEST 12: Missing inventory and transaction rollback
    // -------------------------------------------------------

    [Fact]
    public async Task CreateReturn_WhenSecondProductInventoryIsMissing_ShouldRollback()
    {
        var setup = await SetupAsync(
            productCount: 2,
            missingInventoryProductIndex: 1);

        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsJsonAsync(
            Endpoint,
            CreateReturnRequest(
                setup.SaleId,
                (setup.ProductIds[0], 2),
                (setup.ProductIds[1], 2)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // The first product must not have been restored.
        var firstInventory = await db.Inventories
            .SingleAsync(x => x.ProductId == setup.ProductIds[0]);

        Assert.Equal(50, firstInventory.QuantityInStock);

        Assert.Equal(0, await db.SaleReturns.CountAsync());
        Assert.Equal(0, await db.SaleReturnItems.CountAsync());
    }


    [Fact]
    public async Task CreateReturn_DuplicateProductExceedingSoldQuantity_ShouldRejectRequest()
    {
        // Arrange
        var setup = await SetupAsync(soldQuantity: 5);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateReturnRequest(
            setup.SaleId,
            (setup.ProductIds[0], 3),
            (setup.ProductIds[0], 3));

        // Act
        var response = await client.PostAsJsonAsync(Endpoint, request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventory = await db.Inventories.FirstAsync();

        Assert.Equal(50, inventory.QuantityInStock);
        Assert.Equal(0, await db.SaleReturns.CountAsync());
    }



    // =======================================================
    // TEST DATA SETUP
    // =======================================================

    private static async Task<TestSetup> SetupAsync(
        int productCount = 1,
        int initialStock = 50,
        int soldQuantity = 5,
        decimal originalSellingPrice = 150m,
        int missingInventoryProductIndex = -1,
        SaleStatus saleStatus = SaleStatus.Completed)
    {
        var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(true);

        await factory.InitializeDatabaseAsync();

        var customerId = Guid.NewGuid();
        var saleId = Guid.NewGuid();
        var productIds = new List<Guid>();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "SaleReturnTestCategory",
                IsActive = true
            };

            var customer = new Customer
            {
                Id = customerId,
                FirstName = "Return",
                LastName = "Test",
                Email = "return-test@example.com",
                PhoneNumber = "9876543210",
                IsActive = true
            };

            var sale = new Sale
            {
                Id = saleId,
                InvoiceNumber = $"INV-RETURN-{Guid.NewGuid():N}",
                CustomerId = customerId,
                Customer = customer,
                SaleDate = DateTime.UtcNow,
                Status = saleStatus,
                PaymentStatus = PaymentStatus.Paid,
                CreatedAt = DateTime.UtcNow
            };

            db.Categories.Add(category);
            db.Customers.Add(customer);

            for (var i = 0; i < productCount; i++)
            {
                var product = new Product
                {
                    Id = Guid.NewGuid(),
                    Name = $"Return Test Product {i + 1}",
                    SKU = $"RETURN-TEST-{i + 1}",
                    CategoryId = category.Id,
                    CostPrice = 100m,
                    SellingPrice = originalSellingPrice,
                    IsActive = true
                };

                productIds.Add(product.Id);

                var saleItem = new SaleItem
                {
                    Id = Guid.NewGuid(),
                    SaleId = saleId,
                    Sale = sale,
                    ProductId = product.Id,
                    Product = product,
                    Quantity = soldQuantity,
                    UnitPrice = originalSellingPrice,
                    Discount = 0m,
                    Tax = 0m,
                    Total = originalSellingPrice * soldQuantity
                };

                sale.SaleItems.Add(saleItem);

                db.Products.Add(product);

                if (i != missingInventoryProductIndex)
                {
                    db.Inventories.Add(new Inventory
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        QuantityInStock = initialStock,
                        MinimumStock = 5,
                        MaximumStock = 100,
                        ReorderLevel = 10,
                        IsActive = true
                    });
                }
            }

            sale.SubTotal = productCount * soldQuantity * originalSellingPrice;
            sale.GrandTotal = sale.SubTotal;

            db.Sales.Add(sale);

            await db.SaveChangesAsync();
        }

        var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

        var token = TestJwtTokenGenerator.GenerateToken(
            Guid.NewGuid(), JwtKey);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        return new TestSetup(factory, client, saleId, productIds);
    }

    
    // =======================================================
    // REQUEST HELPERS
    // =======================================================

    private static object CreateReturnRequest(
        Guid saleId,
        (Guid ProductId, int Quantity) firstProduct)
    {
        return CreateReturnRequest(saleId, new[] { firstProduct });
    }

    private static object CreateReturnRequest(
        Guid saleId,
        (Guid ProductId, int Quantity) firstProduct,
        (Guid ProductId, int Quantity) secondProduct)
    {
        return CreateReturnRequest(
            saleId,
            new[] { firstProduct, secondProduct });
    }

    private static object CreateReturnRequest(
        Guid saleId,
        (Guid ProductId, int Quantity)[] products)
    {
        return new
        {
            SaleId = saleId,
            Reason = "Integration test return",
            Items = products.Select(x => new
            {
                ProductId = x.ProductId,
                Quantity = x.Quantity
            }).ToList()
        };
    }

    private sealed record TestSetup(
        BusinessPlatformWebApplicationFactory Factory,
        HttpClient Client,
        Guid SaleId,
        List<Guid> ProductIds);
}
