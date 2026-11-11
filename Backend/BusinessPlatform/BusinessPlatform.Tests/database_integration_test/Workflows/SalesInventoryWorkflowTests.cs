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


public class SalesInventoryWorkflowTests
{
    private const string JwtKey = "IntegrationTestKey-AtLeast32CharactersLong!";

    // -------------------------------------------------------
    // TEST 1: Create sale and deduct inventory
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithValidData_ShouldDeductInventory()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 5),
            paymentAmount: 750m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventory = await db.Inventories
            .FirstAsync(x => x.ProductId == setup.ProductIds[0]);

        var sale = await db.Sales
            .Include(x => x.SaleItems)
            .Include(x => x.Payments)
            .FirstAsync();

        Assert.Equal(45, inventory.QuantityInStock);
        Assert.Single(db.Sales);
        Assert.Single(sale.SaleItems);
        Assert.Single(sale.Payments);
        Assert.Equal(750m, sale.GrandTotal);
        Assert.Equal(PaymentStatus.Paid, sale.PaymentStatus);
    }

    // -------------------------------------------------------
    // TEST 2: Create sale with multiple products
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithMultipleProducts_ShouldDeductStockFromAllProducts()
    {
        var setup = await SetupAsync(productCount: 2);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 3),
            (setup.ProductIds[1], 4),
            paymentAmount: 1050m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventories = await db.Inventories
            .OrderBy(x => x.ProductId)
            .ToListAsync();

        Assert.Equal(47, inventories.Single(
            x => x.ProductId == setup.ProductIds[0]).QuantityInStock);

        Assert.Equal(46, inventories.Single(
            x => x.ProductId == setup.ProductIds[1]).QuantityInStock);

        Assert.Equal(2, await db.SaleItems.CountAsync());
    }

    // -------------------------------------------------------
    // TEST 3: Partial payment
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithPartialPayment_ShouldSetPartiallyPaidStatus()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 2),
            paymentAmount: 100m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var sale = await db.Sales.FirstAsync();

        Assert.Equal(300m, sale.GrandTotal);
        Assert.Equal(PaymentStatus.PartiallyPaid, sale.PaymentStatus);
    }

    // -------------------------------------------------------
    // TEST 4: Insufficient stock
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithInsufficientStock_ShouldRejectAndPreserveInventory()
    {
        var setup = await SetupAsync(initialStock: 5);
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 6),
            paymentAmount: 900m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventory = await db.Inventories.FirstAsync();

        Assert.Equal(5, inventory.QuantityInStock);
        Assert.Equal(0, await db.Sales.CountAsync());
    }

    // -------------------------------------------------------
    // TEST 5: Inactive customer
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithInactiveCustomer_ShouldRejectSale()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var customer = await db.Customers.FindAsync(setup.CustomerId);

            customer!.IsActive = false;
            await db.SaveChangesAsync();
        }

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 2),
            paymentAmount: 300m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDb = verificationScope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        Assert.Equal(0, await verificationDb.Sales.CountAsync());
        Assert.Equal(50, (await verificationDb.Inventories.FirstAsync())
            .QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 6: Inactive product
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithInactiveProduct_ShouldRejectSale()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var product = await db.Products.FindAsync(setup.ProductIds[0]);

            product!.IsActive = false;
            await db.SaveChangesAsync();
        }

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 2),
            paymentAmount: 300m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDb = verificationScope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        Assert.Equal(0, await verificationDb.Sales.CountAsync());
        Assert.Equal(50, (await verificationDb.Inventories.FirstAsync())
            .QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 7: Customer does not exist
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithInvalidCustomer_ShouldReturnNotFound()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateSaleRequest(
            Guid.NewGuid(),
            (setup.ProductIds[0], 2),
            paymentAmount: 300m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.Sales.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }

    // -------------------------------------------------------
    // TEST 8: Invalid payment amount and transaction rollback
    // -------------------------------------------------------

    [Fact]
    public async Task CreateSale_WithZeroPayment_ShouldRollbackInventoryChanges()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var request = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 5),
            paymentAmount: 0m);

        var response = await client.PostAsJsonAsync("/api/Sales", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var inventory = await db.Inventories.FirstAsync();

        Assert.Equal(50, inventory.QuantityInStock);
        Assert.Equal(0, await db.Sales.CountAsync());
        Assert.Equal(0, await db.SaleItems.CountAsync());
        Assert.Equal(0, await db.Payments.CountAsync());
    }

    // -------------------------------------------------------
    // TEST 9: Cancel sale and restore inventory
    // -------------------------------------------------------

    [Fact]
    public async Task CancelSale_ShouldRestoreInventory()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var createRequest = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 5),
            paymentAmount: 750m);

        var createResponse = await client.PostAsJsonAsync(
            "/api/Sales", createRequest);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var sale = await db.Sales.FirstAsync();

        var inventoryAfterSale = await db.Inventories.FirstAsync();

        Assert.Equal(45, inventoryAfterSale.QuantityInStock);

        var cancelResponse = await client.PostAsync(
            $"/api/Sales/{sale.Id}/cancel", null);

        Assert.Equal(HttpStatusCode.OK, cancelResponse.StatusCode);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDb = verificationScope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var restoredInventory = await verificationDb.Inventories.FirstAsync();
        var cancelledSale = await verificationDb.Sales.FirstAsync();

        Assert.Equal(50, restoredInventory.QuantityInStock);
        Assert.Equal(SaleStatus.Cancelled, cancelledSale.Status);
    }

    // -------------------------------------------------------
    // TEST 10: Prevent restoring inventory twice
    // -------------------------------------------------------

    [Fact]
    public async Task CancelSale_WhenAlreadyCancelled_ShouldNotRestoreStockAgain()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var createRequest = CreateSaleRequest(
            setup.CustomerId,
            (setup.ProductIds[0], 5),
            paymentAmount: 750m);

        var createResponse = await client.PostAsJsonAsync(
            "/api/Sales", createRequest);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var sale = await db.Sales.FirstAsync();

        var firstCancel = await client.PostAsync(
            $"/api/Sales/{sale.Id}/cancel", null);

        Assert.Equal(HttpStatusCode.OK, firstCancel.StatusCode);

        var secondCancel = await client.PostAsync(
            $"/api/Sales/{sale.Id}/cancel", null);

        Assert.Equal(HttpStatusCode.BadRequest, secondCancel.StatusCode);

        using var verificationScope = factory.Services.CreateScope();
        var verificationDb = verificationScope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var inventory = await verificationDb.Inventories.FirstAsync();

        Assert.Equal(50, inventory.QuantityInStock);
        Assert.Equal(SaleStatus.Cancelled,
            (await verificationDb.Sales.FirstAsync()).Status);
    }

    // -------------------------------------------------------
    // TEST 11: Cancel nonexistent sale
    // -------------------------------------------------------

    [Fact]
    public async Task CancelSale_WithInvalidId_ShouldReturnNotFound()
    {
        var setup = await SetupAsync();
        using var factory = setup.Factory;
        using var client = setup.Client;

        var response = await client.PostAsync(
            $"/api/Sales/{Guid.NewGuid()}/cancel", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.Equal(0, await db.Sales.CountAsync());
        Assert.Equal(50, (await db.Inventories.FirstAsync()).QuantityInStock);
    }


    // =======================================================
    // HELPER METHODS
    // =======================================================

    private static async Task<TestSetup> SetupAsync(
        int productCount = 1,
        int initialStock = 50)
    {
        var factory = new BusinessPlatformWebApplicationFactory();

        factory.SetPermissionResult(true);

        await factory.InitializeDatabaseAsync();

        var customerId = Guid.NewGuid();
        var productIds = new List<Guid>();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "SalesTestCategory",
                IsActive = true
            };

            var customer = new Customer
            {
                Id = customerId,
                FirstName = "Test",
                LastName = "Customer",
                Email = "sales-test@example.com",
                PhoneNumber = "9876543210",
                IsActive = true
            };

            db.Categories.Add(category);
            db.Customers.Add(customer);

            for (var i = 0; i < productCount; i++)
            {
                var product = new Product
                {
                    Id = Guid.NewGuid(),
                    Name = $"Test Product {i + 1}",
                    SKU = $"SALE-TEST-{i + 1}",
                    CategoryId = category.Id,
                    CostPrice = 100m,
                    SellingPrice = 150m,
                    IsActive = true
                };

                var inventory = new Inventory
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    QuantityInStock = initialStock,
                    MinimumStock = 5,
                    MaximumStock = 100,
                    ReorderLevel = 10,
                    IsActive = true
                };

                db.Products.Add(product);
                db.Inventories.Add(inventory);

                productIds.Add(product.Id);
            }

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

        return new TestSetup(factory, client, customerId, productIds);
    }

    private static object CreateSaleRequest(
        Guid customerId,
        (Guid ProductId, int Quantity) firstProduct,
        decimal paymentAmount)
    {
        return CreateSaleRequest(
            customerId,
            new[] { firstProduct },
            paymentAmount);
    }

    private static object CreateSaleRequest(
        Guid customerId,
        (Guid ProductId, int Quantity) firstProduct,
        (Guid ProductId, int Quantity) secondProduct,
        decimal paymentAmount)
    {
        return CreateSaleRequest(
            customerId,
            new[] { firstProduct, secondProduct },
            paymentAmount);
    }

    private static object CreateSaleRequest(
        Guid customerId,
        (Guid ProductId, int Quantity)[] products,
        decimal paymentAmount)
    {
        return new
        {
            CustomerId = customerId,
            Discount = 0m,
            Tax = 0m,
            Remarks = "Integration test sale",
            Items = products.Select(x => new
            {
                ProductId = x.ProductId,
                Quantity = x.Quantity,
                Discount = 0m
            }).ToList(),
            Payments = new[]
            {
                new
                {
                    Amount = paymentAmount,
                    Method = PaymentMethod.Cash,
                    TransactionReference = (string?)null
                }
            }
        };
    }

    private sealed record TestSetup(
        BusinessPlatformWebApplicationFactory Factory,
        HttpClient Client,
        Guid CustomerId,
        List<Guid> ProductIds);
}
