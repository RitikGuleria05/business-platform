
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

public class InventoryControllerIntegrationTests
{
    private const string Password = "TestPassword123!";

    private async Task<(BusinessPlatformWebApplicationFactory Factory, HttpClient Client)>
        CreateAuthenticatedClientAsync(bool permissionAllowed = true)
    {
        var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(permissionAllowed);

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "InventoryTestUser",
                Email = $"inventory-{Guid.NewGuid():N}@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password),
                RoleId = role.Id,
                Role = role,
                IsActive = true
            };

            db.Roles.Add(role);
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var client = factory.CreateClient();

            var loginResponse = await client.PostAsJsonAsync(
                "/api/auth/login",
                new { Email = user.Email, Password });

            loginResponse.EnsureSuccessStatusCode();

            var loginJson = await loginResponse.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(loginJson);

            var token = document.RootElement
                .GetProperty("token")
                .GetString();

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            return (factory, client);
        }
    }

    private static async Task<Guid> SeedInventoryAsync(
     BusinessPlatformWebApplicationFactory factory,
     int quantity = 50,
     int minimumStock = 10,
     int maximumStock = 100,
     int reorderLevel = 20)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = $"Test Category {Guid.NewGuid():N}",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var productId = Guid.NewGuid();

        var product = new Product
        {
            Id = productId,
            Name = "Test Product",
            SKU = $"SKU-{Guid.NewGuid():N}",
            CategoryId = category.Id,
            Category = category,
            CostPrice = 100,
            SellingPrice = 150,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var inventory = new Inventory
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Product = product,
            QuantityInStock = quantity,
            MinimumStock = minimumStock,
            MaximumStock = maximumStock,
            ReorderLevel = reorderLevel,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow 
        };

        product.Inventory = inventory;

        db.Categories.Add(category);
        db.Products.Add(product);
        db.Inventories.Add(inventory);

        await db.SaveChangesAsync();

        return productId;
    }

    private static async Task<Inventory> GetInventoryAsync(BusinessPlatformWebApplicationFactory factory,Guid productId)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await db.Inventories.SingleAsync(i => i.ProductId == productId);
    }

    // GET ALL

    [Fact]
    public async Task GetAll_WithPermission_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedInventoryAsync(factory);

            var response = await client.GetAsync("/api/inventory");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventories = await response.Content.ReadFromJsonAsync<List<JsonElement>>();

            Assert.NotNull(inventories);
            Assert.NotEmpty(inventories);
        }
    }

    [Fact]
    public async Task GetAll_WithoutPermission_ReturnsForbidden()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync(false);

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/inventory");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }

    // GET BY PRODUCT ID

    [Fact]
    public async Task GetByProduct_WithExistingProduct_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory);

            var response = await client.GetAsync($"/api/inventory/{productId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventory = await response.Content.ReadFromJsonAsync<JsonElement>();

            Assert.Equal(productId,inventory.GetProperty("productId").GetGuid());
        }
    }

    [Fact]
    public async Task GetByProduct_WithNonExistingProduct_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync($"/api/inventory/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // INCREASE STOCK

    [Fact]
    public async Task IncreaseStock_WithValidQuantity_IncreasesStock()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory, quantity: 50);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/increase",
                new
                {
                    ProductId = productId,
                    Quantity = 20
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(70, inventory.QuantityInStock);
            Assert.NotNull(inventory.UpdatedAt);
        }
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task IncreaseStock_WithInvalidQuantity_ReturnsBadRequest(int quantity)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/increase",
                new
                {
                    ProductId = productId,
                    Quantity = quantity
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task IncreaseStock_WithNonExistingProduct_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/inventory/increase",
                new
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 10
                });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // DECREASE STOCK

    [Fact]
    public async Task DecreaseStock_WithValidQuantity_DecreasesStock()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory, quantity: 50);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/decrease",
                new
                {
                    ProductId = productId,
                    Quantity = 20
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(30, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task DecreaseStock_WithInsufficientStock_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory, quantity: 10);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/decrease",
                new
                {
                    ProductId = productId,
                    Quantity = 20
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(10, inventory.QuantityInStock);
        }
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task DecreaseStock_WithInvalidQuantity_ReturnsBadRequest(int quantity)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/decrease",
                new
                {
                    ProductId = productId,
                    Quantity = quantity
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task DecreaseStock_WithNonExistingProduct_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/inventory/decrease",
                new
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 5
                });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // ADJUST STOCK

    [Fact]
    public async Task AdjustStock_WithValidQuantity_UpdatesStock()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory, quantity: 50);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/adjust",
                new
                {
                    ProductId = productId,
                    NewQuantity = 80,
                    Reason = "Physical stock count"
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(80, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task AdjustStock_WithNegativeQuantity_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/inventory/adjust",
                new
                {
                    ProductId = productId,
                    NewQuantity = -10,
                    Reason = "Invalid adjustment"
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task AdjustStock_WithNonExistingProduct_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/inventory/adjust",
                new
                {
                    ProductId = Guid.NewGuid(),
                    NewQuantity = 20
                });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // UPDATE INVENTORY SETTINGS

    [Fact]
    public async Task UpdateSettings_WithValidRequest_UpdatesSettings()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory);

            var response = await client.PutAsJsonAsync($"/api/inventory/{productId}",
                new
                {
                    MinimumStock = 15,
                    MaximumStock = 200,
                    ReorderLevel = 30
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(15, inventory.MinimumStock);
            Assert.Equal(200, inventory.MaximumStock);
            Assert.Equal(30, inventory.ReorderLevel);
        }
    }

    [Theory]
    [InlineData(-1, 100, 20)]
    [InlineData(10, -1, 5)]
    [InlineData(10, 100, -1)]
    [InlineData(150, 100, 20)]
    [InlineData(10, 100, 150)]
    public async Task UpdateSettings_WithInvalidValues_ReturnsBadRequest(int minimumStock,int maximumStock,int reorderLevel)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var productId = await SeedInventoryAsync(factory);

            var response = await client.PutAsJsonAsync($"/api/inventory/{productId}",
                new
                {
                    MinimumStock = minimumStock,
                    MaximumStock = maximumStock,
                    ReorderLevel = reorderLevel
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task UpdateSettings_WithNonExistingProduct_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PutAsJsonAsync(
                $"/api/inventory/{Guid.NewGuid()}",
                new
                {
                    MinimumStock = 10,
                    MaximumStock = 100,
                    ReorderLevel = 20
                });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // LOW STOCK

    [Fact]
    public async Task GetLowStock_ReturnsOnlyProductsAtOrBelowReorderLevel()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var lowStockProductId = await SeedInventoryAsync(factory, quantity: 15, reorderLevel: 20);

            await SeedInventoryAsync(factory, quantity: 50, reorderLevel: 20);

            var response = await client.GetAsync("/api/inventory/low-stock");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventories = await response.Content.ReadFromJsonAsync<List<JsonElement>>();

            Assert.NotNull(inventories);
            Assert.Single(inventories);

            Assert.Equal(lowStockProductId,inventories[0].GetProperty("productId").GetGuid());
        }
    }

    // OUT OF STOCK

    [Fact]
    public async Task GetOutOfStock_ReturnsOnlyProductsWithZeroQuantity()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var outOfStockProductId = await SeedInventoryAsync(factory, quantity: 0);

            await SeedInventoryAsync(factory, quantity: 10);

            var response = await client.GetAsync("/api/inventory/out-of-stock");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var inventories = await response.Content.ReadFromJsonAsync<List<JsonElement>>();

            Assert.NotNull(inventories);
            Assert.Single(inventories);

            Assert.Equal(outOfStockProductId,inventories[0].GetProperty("productId").GetGuid());
        }
    }

    // PERMISSION CHECKS

    [Theory]
    [InlineData("GET", "/api/inventory/{id}")]
    [InlineData("PUT", "/api/inventory/{id}")]
    [InlineData("POST", "/api/inventory/increase")]
    [InlineData("POST", "/api/inventory/decrease")]
    [InlineData("POST", "/api/inventory/adjust")]
    [InlineData("GET", "/api/inventory/low-stock")]
    [InlineData("GET", "/api/inventory/out-of-stock")]
    public async Task Endpoints_WithoutPermission_ReturnForbidden(string method,string route)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync(false);

        using (factory)
        using (client)
        {
            var productId = Guid.NewGuid();

            route = route.Replace("{id}", productId.ToString());

            using var request = new HttpRequestMessage(new HttpMethod(method),route);

            if (method != "GET")
            {
                request.Content = JsonContent.Create(new
                {
                    ProductId = productId,
                    Quantity = 1,
                    NewQuantity = 1,
                    MinimumStock = 1,
                    MaximumStock = 10,
                    ReorderLevel = 2
                });
            }

            var response = await client.SendAsync(request);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }
}
