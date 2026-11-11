using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BusinessPlatform.Application.DTOs.Product;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class ProductInventoryWorkflowTests
{
    private const string JwtKey =
        "IntegrationTestKey-AtLeast32CharactersLong!";

    private static async Task<(BusinessPlatformWebApplicationFactory Factory,
        HttpClient Client, Guid CategoryId)> SetupAsync()
    {
        var factory = new BusinessPlatformWebApplicationFactory();

        factory.SetPermissionResult(true);

        await factory.InitializeDatabaseAsync();

        Guid categoryId;

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "TestCategory",
                IsActive = true
            };

            db.Categories.Add(category);
            await db.SaveChangesAsync();

            categoryId = category.Id;
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

        return (factory, client, categoryId);
    }

    private static CreateProductRequest CreateRequest(Guid categoryId)
    {
        return new CreateProductRequest
        {
            Name = "Test Product",
            SKU = "TEST-001",
            Barcode = "123456789",
            Description = "Integration test product",
            CategoryId = categoryId,
            CostPrice = 100,
            SellingPrice = 150,
            InitialStock = 50,
            MinimumStock = 5,
            MaximumStock = 100,
            ReorderLevel = 10
        };
    }

    [Fact]
    public async Task CreateProduct_WithValidData_CreatesProductAndInventory()
    {
        var (factory, client, categoryId) = await SetupAsync();

        using (factory)
        using (client)
        {
            var request = CreateRequest(categoryId);

            var response = await client.PostAsJsonAsync(
                "/api/product", request);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<ProductResponse>();

            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.SKU, result.SKU);
            Assert.Equal(request.InitialStock, result.QuantityInStock);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var product = await db.Products.FindAsync(result.Id);
            var inventory = await db.Inventories
                .FirstOrDefaultAsync(x => x.ProductId == result.Id);

            Assert.NotNull(product);
            Assert.NotNull(inventory);
            Assert.Equal(50, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task CreateProduct_WithZeroInitialStock_CreatesInventoryWithZeroQuantity()
    {
        var (factory, client, categoryId) = await SetupAsync();

        using (factory)
        using (client)
        {
            var request = CreateRequest(categoryId);
            request.InitialStock = 0;

            var response = await client.PostAsJsonAsync(
                "/api/product", request);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var product = await db.Products
                .FirstOrDefaultAsync(x => x.SKU == request.SKU);

            Assert.NotNull(product);

            var inventory = await db.Inventories
                .FirstOrDefaultAsync(x => x.ProductId == product.Id);

            Assert.NotNull(inventory);
            Assert.Equal(0, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task CreateProduct_WithInitialStock_CreatesInventoryWithRequestedQuantity()
    {
        var (factory, client, categoryId) = await SetupAsync();

        using (factory)
        using (client)
        {
            var request = CreateRequest(categoryId);
            request.InitialStock = 75;

            var response = await client.PostAsJsonAsync(
                "/api/product", request);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var product = await db.Products
                .FirstOrDefaultAsync(x => x.SKU == request.SKU);

            Assert.NotNull(product);

            var inventory = await db.Inventories
                .FirstOrDefaultAsync(x => x.ProductId == product.Id);

            Assert.NotNull(inventory);
            Assert.Equal(75, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task CreateProduct_WithInvalidCategory_ReturnsNotFound()
    {
        var (factory, client, _) = await SetupAsync();

        using (factory)
        using (client)
        {
            var request = CreateRequest(Guid.NewGuid());

            var response = await client.PostAsJsonAsync(
                "/api/product", request);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Assert.False(await db.Products.AnyAsync(x => x.SKU == request.SKU));
        }
    }

    [Fact]
    public async Task CreateProduct_WithDuplicateSKU_ReturnsBadRequest()
    {
        var (factory, client, categoryId) = await SetupAsync();

        using (factory)
        using (client)
        {
            var request = CreateRequest(categoryId);

            var firstResponse = await client.PostAsJsonAsync(
                "/api/product", request);

            Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

            var secondResponse = await client.PostAsJsonAsync(
                "/api/product", request);

            Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Assert.Equal(1, await db.Products.CountAsync(x => x.SKU == request.SKU));
        }
    }

    [Fact]
    public async Task CreateProduct_WithDuplicateBarcode_ReturnsBadRequest()
    {
        var (factory, client, categoryId) = await SetupAsync();

        using (factory)
        using (client)
        {
            var firstRequest = CreateRequest(categoryId);

            var firstResponse = await client.PostAsJsonAsync(
                "/api/product", firstRequest);

            Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

            var secondRequest = CreateRequest(categoryId);
            secondRequest.SKU = "TEST-002";

            var secondResponse = await client.PostAsJsonAsync(
                "/api/product", secondRequest);

            Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            Assert.Equal(1, await db.Products.CountAsync(x => x.Barcode == firstRequest.Barcode));
        }
    }

    [Fact]
    public async Task CreateProduct_WhenInventoryCreationFails_RollsBackProduct()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();

        factory.SetPermissionResult(true);
        factory.SetInventoryCreationFailure(true);

        await factory.InitializeDatabaseAsync();

        Guid categoryId;

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "RollbackCategory",
                IsActive = true
            };

            db.Categories.Add(category);
            await db.SaveChangesAsync();

            categoryId = category.Id;
        }

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

        var token = TestJwtTokenGenerator.GenerateToken(Guid.NewGuid(), JwtKey);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = CreateRequest(categoryId);

        var response = await client.PostAsJsonAsync("/api/product", request);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        using var verifyScope = factory.Services.CreateScope();

        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.False(await verifyDb.Products.AnyAsync(x => x.SKU == request.SKU));

        Assert.False(await verifyDb.Inventories.AnyAsync(x => x.ProductId == Guid.Empty));
    }
}
