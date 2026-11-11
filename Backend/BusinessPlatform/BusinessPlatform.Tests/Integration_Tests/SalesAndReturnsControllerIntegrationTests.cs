using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Enums;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

public class SalesAndReturnsControllerIntegrationTests
{
    private const string Password = "TestPassword123!";

    private async Task<(BusinessPlatformWebApplicationFactory Factory, HttpClient Client)>
        CreateAuthenticatedClientAsync(bool permissionAllowed = true)
    {
        var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(permissionAllowed);

        await factory.InitializeDatabaseAsync();

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
                UserName = "SalesTestUser",
                Email = $"sales-{Guid.NewGuid():N}@example.com",
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

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            return (factory, client);
        }
    }

    private static async Task<(Guid CustomerId, Guid ProductId)> SeedSaleDependenciesAsync(
        BusinessPlatformWebApplicationFactory factory,
        int stock = 50,
        decimal sellingPrice = 100)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = $"Sales Category {Guid.NewGuid():N}",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FirstName = "Sales",
            LastName = "Customer",
            Email = $"sales-customer-{Guid.NewGuid():N}@example.com",
            PhoneNumber = $"9{Random.Shared.Next(100000000, 999999999)}",
            Address = "Test Address",
            City = "Shimla",
            State = "Himachal Pradesh",
            PostalCode = "171001",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var productId = Guid.NewGuid();

        var product = new Product
        {
            Id = productId,
            Name = "Sales Test Product",
            SKU = $"SKU-{Guid.NewGuid():N}",
            CategoryId = category.Id,
            Category = category,
            CostPrice = 50,
            SellingPrice = sellingPrice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var inventory = new Inventory
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Product = product,
            QuantityInStock = stock,
            MinimumStock = 5,
            MaximumStock = 100,
            ReorderLevel = 10,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        product.Inventory = inventory;

        db.Categories.Add(category);
        db.Customers.Add(customer);
        db.Products.Add(product);
        db.Inventories.Add(inventory);

        await db.SaveChangesAsync();

        return (customer.Id, productId);
    }

    private static async Task<Inventory> GetInventoryAsync(
        BusinessPlatformWebApplicationFactory factory,
        Guid productId)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await db.Inventories
            .SingleAsync(x => x.ProductId == productId);
    }

    private static async Task<Sale> GetSaleAsync(
        BusinessPlatformWebApplicationFactory factory,
        Guid saleId)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await db.Sales
            .Include(x => x.SaleItems)
            .Include(x => x.Payments)
            .SingleAsync(x => x.Id == saleId);
    }

    private static object CreateSaleRequest(
        Guid customerId,
        Guid productId,
        int quantity = 2,
        decimal discount = 0,
        decimal tax = 0,
        decimal paymentAmount = 200)
    {
        return new
        {
            CustomerId = customerId,
            Discount = discount,
            Tax = tax,
            Remarks = "Integration test sale",
            Items = new[]
            {
                new
                {
                    ProductId = productId,
                    Quantity = quantity,
                    Discount = 0
                }
            },
            Payments = new[]
            {
                new
                {
                    Amount = paymentAmount,
                    Method = PaymentMethod.Cash,
                    TransactionReference = "TEST-PAYMENT"
                }
            }
        };
    }

    private async Task<Guid> CreateSaleAsync(
        HttpClient client,
        Guid customerId,
        Guid productId,
        int quantity = 2,
        decimal discount = 0,
        decimal tax = 0,
        decimal paymentAmount = 200)
    {
        var response = await client.PostAsJsonAsync(
            "/api/sales",
            CreateSaleRequest(
                customerId,
                productId,
                quantity,
                discount,
                tax,
                paymentAmount));

        response.EnsureSuccessStatusCode();

        var sale = await response.Content.ReadFromJsonAsync<JsonElement>();

        return sale.GetProperty("id").GetGuid();
    }

    // =========================================================
    // GET SALES
    // =========================================================

    [Fact]
    public async Task GetAll_WithPermission_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            await CreateSaleAsync(client, customerId, productId);

            var response = await client.GetAsync("/api/sales");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var sales = await response.Content
                .ReadFromJsonAsync<List<JsonElement>>();

            Assert.NotNull(sales);
            Assert.NotEmpty(sales);
        }
    }

    [Fact]
    public async Task GetAll_WithoutPermission_ReturnsForbidden()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync(false);

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/sales");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetById_WithExistingSale_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(
                client, customerId, productId);

            var response = await client.GetAsync(
                $"/api/sales/{saleId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetById_WithNonExistingSale_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync(
                $"/api/sales/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // =========================================================
    // CREATE SALE
    // =========================================================

    [Fact]
    public async Task Create_WithValidRequest_ReturnsCreatedAndDeductsStock()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            // Arrange
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory, stock: 50);

            // Act
            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId,
                    productId,
                    quantity: 5,
                    paymentAmount: 500));

            // Assert HTTP response
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var sale = await response.Content
                .ReadFromJsonAsync<JsonElement>();

            var saleId = sale.GetProperty("id").GetGuid();

            Assert.False(string.IsNullOrWhiteSpace(
                sale.GetProperty("invoiceNumber").GetString()));

            Assert.Equal(500m,
                sale.GetProperty("subTotal").GetDecimal());

            Assert.Equal(500m,
                sale.GetProperty("grandTotal").GetDecimal());

            Assert.Single(sale.GetProperty("items").EnumerateArray());

            Assert.Single(sale.GetProperty("payments").EnumerateArray());

            // Verify inventory deduction
            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(45, inventory.QuantityInStock);

            // Verify database persistence
            var savedSale = await GetSaleAsync(factory, saleId);

            Assert.Single(savedSale.SaleItems);

            Assert.Single(savedSale.Payments);

            Assert.Equal(PaymentStatus.Paid, savedSale.PaymentStatus);
        }
    }

    [Fact]
    public async Task Create_WithPartialPayment_SetsPartiallyPaidStatus()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId,
                    productId,
                    quantity: 2,
                    paymentAmount: 100));

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var sale = await response.Content
                .ReadFromJsonAsync<JsonElement>();

            Assert.Equal(
                (int)PaymentStatus.PartiallyPaid,
                sale.GetProperty("paymentStatus").GetInt32());
        }
    }

    [Fact]
    public async Task Create_WithEmptyItems_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/sales",
                new
                {
                    CustomerId = Guid.NewGuid(),
                    Items = Array.Empty<object>(),
                    Payments = new[]
                    {
                        new
                        {
                            Amount = 100,
                            Method = PaymentMethod.Cash
                        }
                    }
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithEmptyPayments_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                new
                {
                    CustomerId = customerId,
                    Items = new[]
                    {
                        new
                        {
                            ProductId = productId,
                            Quantity = 1,
                            Discount = 0
                        }
                    },
                    Payments = Array.Empty<object>()
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task Create_WithInvalidItemQuantity_ReturnsBadRequest(
        int quantity)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId, productId, quantity: quantity));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Theory]
    [InlineData(-1, 0)]
    [InlineData(0, -1)]
    public async Task Create_WithNegativeSaleDiscountOrTax_ReturnsBadRequest(
        decimal discount,
        decimal tax)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId,
                    productId,
                    discount: discount,
                    tax: tax));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithNonExistingCustomer_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (_, productId) =
                await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    Guid.NewGuid(), productId));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithInactiveCustomer_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var customer = await db.Customers.FindAsync(customerId);

                customer!.IsActive = false;

                await db.SaveChangesAsync();
            }

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(customerId, productId));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithNonExistingProduct_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, _) = await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(customerId, Guid.NewGuid()));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithInactiveProduct_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            // Arrange
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            // Make product inactive
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var product = await db.Products.FindAsync(productId);

                Assert.NotNull(product);

                product.IsActive = false;

                await db.SaveChangesAsync();
            }

            // Act
            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId,
                    productId,
                    quantity: 2,
                    paymentAmount: 200));

            var responseBody = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.True(
                response.StatusCode == HttpStatusCode.BadRequest,
                $"Expected BadRequest (400), but received " +
                $"{(int)response.StatusCode} ({response.StatusCode}). " +
                $"Response: {responseBody}");

            // Verify that no inventory was deducted
            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(50, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task Create_WithInsufficientStock_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory, stock: 2);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(customerId, productId, quantity: 5));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(2, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task Create_WithMissingInventory_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var inventory = await db.Inventories.SingleAsync(x => x.ProductId == productId);

                db.Inventories.Remove(inventory);

                await db.SaveChangesAsync();
            }

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(customerId, productId));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithPaymentGreaterThanGrandTotal_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId,
                    productId,
                    quantity: 1,
                    paymentAmount: 500));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public async Task Create_WithInvalidPaymentAmount_ReturnsBadRequest(
        decimal amount)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/sales",
                CreateSaleRequest(
                    customerId,
                    productId,
                    quantity: 1,
                    paymentAmount: amount));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    // =========================================================
    // CANCEL SALE
    // =========================================================

    [Fact]
    public async Task Cancel_WithExistingSale_CancelsSaleAndRestoresStock()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory, stock: 50);

            var saleId = await CreateSaleAsync(client, customerId, productId, quantity: 5);

            var response = await client.PostAsync(
                $"/api/sales/{saleId}/cancel",
                null);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var sale = await GetSaleAsync(factory, saleId);

            Assert.Equal(SaleStatus.Cancelled, sale.Status);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(50, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task Cancel_WithNonExistingSale_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsync(
                $"/api/sales/{Guid.NewGuid()}/cancel",
                null);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Cancel_AlreadyCancelledSale_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId);

            var firstResponse = await client.PostAsync(
                $"/api/sales/{saleId}/cancel",
                null);

            Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);

            var secondResponse = await client.PostAsync(
                $"/api/sales/{saleId}/cancel",
                null);

            Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);
        }
    }

    // =========================================================
    // SALES RETURNS
    // =========================================================

    private static object CreateReturnRequest(Guid saleId,Guid productId,int quantity = 1)
    {
        return new
        {
            SaleId = saleId,
            Reason = "Customer returned product",
            Items = new[]
            {
                new
                {
                    ProductId = productId,
                    Quantity = quantity
                }
            }
        };
    }

    private async Task<Guid> CreateReturnAsync(HttpClient client, Guid saleId,Guid productId,int quantity = 1)
    {
        var response = await client.PostAsJsonAsync(
            "/api/salereturns",
            CreateReturnRequest(saleId, productId, quantity));

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<JsonElement>();

        return result.GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task CreateReturn_WithValidRequest_ReturnsCreatedAndRestoresStock()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory, stock: 50);

            var saleId = await CreateSaleAsync(client, customerId, productId, quantity: 5);

            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(saleId, productId, quantity: 2));

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var saleReturn = await response.Content.ReadFromJsonAsync<JsonElement>();

            Assert.Equal(200m,saleReturn.GetProperty("totalAmount").GetDecimal());

            Assert.Single(saleReturn.GetProperty("items").EnumerateArray());

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(47, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task CreateReturn_WithEmptyItems_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                new
                {
                    SaleId = Guid.NewGuid(),
                    Items = Array.Empty<object>()
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task CreateReturn_WithNonExistingSale_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (_, productId) = await SeedSaleDependenciesAsync(factory);

            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(Guid.NewGuid(), productId));

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task CreateReturn_WithCancelledSale_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId);

            var cancelResponse = await client.PostAsync(
                $"/api/sales/{saleId}/cancel",
                null);

            Assert.Equal(HttpStatusCode.OK, cancelResponse.StatusCode);

            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(saleId, productId));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task CreateReturn_WithInvalidQuantity_ReturnsBadRequest(int quantity)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId);

            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(saleId, productId, quantity));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task CreateReturn_WithProductNotInSale_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId);

            var anotherProductId = Guid.NewGuid();

            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(saleId, anotherProductId));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task CreateReturn_WithQuantityGreaterThanSold_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(
                client, customerId, productId, quantity: 3);

            var response = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(saleId, productId, quantity: 4));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task CreateReturn_WithPreviouslyReturnedQuantity_RejectsExcessReturn()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) =
                await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(
                client, customerId, productId, quantity: 5);

            var firstReturn = await client.PostAsJsonAsync(
                "/api/salereturns",
                CreateReturnRequest(saleId, productId, quantity: 3));

            Assert.Equal(HttpStatusCode.Created, firstReturn.StatusCode);

            var secondReturn = await client.PostAsJsonAsync("/api/salereturns",
                CreateReturnRequest(saleId, productId, quantity: 3));

            Assert.Equal(HttpStatusCode.BadRequest, secondReturn.StatusCode);
        }
    }

    [Fact]
    public async Task CreateReturn_WithRemainingQuantity_ReturnsSuccessfully()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId, quantity: 5);

            var firstReturn = await client.PostAsJsonAsync("/api/salereturns",CreateReturnRequest(saleId, productId, quantity: 3));

            Assert.Equal(HttpStatusCode.Created, firstReturn.StatusCode);

            var secondReturn = await client.PostAsJsonAsync("/api/salereturns",CreateReturnRequest(saleId, productId, quantity: 2));

            Assert.Equal(HttpStatusCode.Created, secondReturn.StatusCode);

            var inventory = await GetInventoryAsync(factory, productId);

            Assert.Equal(50, inventory.QuantityInStock);
        }
    }

    [Fact]
    public async Task GetReturnById_WithExistingReturn_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId);

            var returnId = await CreateReturnAsync(client, saleId, productId);

            var response = await client.GetAsync($"/api/salereturns/{returnId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetReturnById_WithNonExistingReturn_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync($"/api/salereturns/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetReturnsBySaleId_WithExistingSale_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var (customerId, productId) = await SeedSaleDependenciesAsync(factory);

            var saleId = await CreateSaleAsync(client, customerId, productId);

            await CreateReturnAsync(client, saleId, productId);

            var response = await client.GetAsync($"/api/salereturns/sale/{saleId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var returns = await response.Content.ReadFromJsonAsync<List<JsonElement>>();

            Assert.NotNull(returns);
            Assert.Single(returns);
        }
    }

    [Fact]
    public async Task GetReturnsBySaleId_WithNonExistingSale_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync($"/api/salereturns/sale/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // =========================================================
    // SALES RETURN PERMISSIONS
    // =========================================================

    [Theory]
    [InlineData("POST", "/api/salereturns")]
    [InlineData("GET", "/api/salereturns/{id}")]
    [InlineData("GET", "/api/salereturns/sale/{id}")]
    public async Task SaleReturnEndpoints_WithoutPermission_ReturnForbidden(string method,string route)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync(false);

        using (factory)
        using (client)
        {
            route = route.Replace("{id}", Guid.NewGuid().ToString());

            using var request = new HttpRequestMessage(new HttpMethod(method), route);

            if (method == "POST")
            {
                request.Content = JsonContent.Create(new
                {
                    SaleId = Guid.NewGuid(),
                    Items = new[]
                    {
                        new
                        {
                            ProductId = Guid.NewGuid(),
                            Quantity = 1
                        }
                    }
                });
            }

            var response = await client.SendAsync(request);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }
}
