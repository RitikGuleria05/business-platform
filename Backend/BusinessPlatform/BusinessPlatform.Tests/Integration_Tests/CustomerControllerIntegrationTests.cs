using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace BusinessPlatform.Tests.Integration_Tests;

public class CustomerControllerIntegrationTests
{
    private const string Password = "TestPassword123!";

    private async Task<(BusinessPlatformWebApplicationFactory Factory,
        HttpClient Client)> CreateAuthenticatedClientAsync(
        bool permissionAllowed = true)
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
                UserName = "CustomerTestUser",
                Email = $"customer-{Guid.NewGuid():N}@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password),
                RoleId = role.Id,
                Role = role,
                IsActive = true
            };

            db.Roles.Add(role);
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var email = user.Email;

            var client = factory.CreateClient();

            var loginResponse = await client.PostAsJsonAsync(
                "/api/auth/login",
                new { Email = email, Password });

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

    private static async Task<Guid> SeedCustomerAsync(BusinessPlatformWebApplicationFactory factory,string? email = null,string? phone = null,bool isActive = true)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "Customer",
            Email = email ?? $"customer-{Guid.NewGuid():N}@example.com",
            PhoneNumber = phone ?? $"9{Random.Shared.Next(100000000, 999999999)}",
            Address = "Test Address",
            City = "Shimla",
            State = "Himachal Pradesh",
            PostalCode = "171001",
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow
        };

        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        return customer.Id;
    }

    [Fact]
    public async Task GetAll_WithPermission_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/customers");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetAll_WithoutPermission_ReturnsForbidden()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync(false);

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/customers");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetAll_ReturnsOnlyActiveCustomers()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedCustomerAsync(factory, isActive: true);
            await SeedCustomerAsync(factory, isActive: false);

            var response = await client.GetAsync("/api/customers");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var customers = await response.Content
                .ReadFromJsonAsync<List<JsonElement>>();

            Assert.NotNull(customers);
            Assert.All(customers, customer => Assert.True(customer.GetProperty("isActive").GetBoolean()));
        }
    }

    [Fact]
    public async Task GetById_WithExistingCustomer_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var customerId = await SeedCustomerAsync(factory);

            var response = await client.GetAsync($"/api/customers/{customerId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetById_WithNonExistingId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync($"/api/customers/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithValidRequest_ReturnsCreated()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/customers",
                new
                {
                    FirstName = "Ritik",
                    LastName = "Guleria",
                    Email = "new-customer@example.com",
                    PhoneNumber = "9876543210",
                    Address = "Test Address",
                    City = "Shimla",
                    State = "Himachal Pradesh",
                    PostalCode = "171001"
                });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var customer = await response.Content.ReadFromJsonAsync<JsonElement>();

            Assert.Equal("Ritik",customer.GetProperty("firstName").GetString());

            Assert.Equal("new-customer@example.com",customer.GetProperty("email").GetString());
        }
    }

    [Fact]
    public async Task Create_WithDuplicateEmail_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            const string email = "duplicate-email@example.com";

            await SeedCustomerAsync(factory, email: email);

            var response = await client.PostAsJsonAsync(
                "/api/customers",
                new
                {
                    FirstName = "Another",
                    LastName = "Customer",
                    Email = email,
                    PhoneNumber = "9876543210"
                });

            Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithDuplicatePhone_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            const string phone = "9876543210";

            await SeedCustomerAsync(factory, phone: phone);

            var response = await client.PostAsJsonAsync(
                "/api/customers",
                new
                {
                    FirstName = "Another",
                    LastName = "Customer",
                    Email = "another-customer@example.com",
                    PhoneNumber = phone
                });

            Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithValidRequest_ReturnsOkAndUpdatesCustomer()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var customerId = await SeedCustomerAsync(factory);

            var response = await client.PutAsJsonAsync(
                $"/api/customers/{customerId}",
                new
                {
                    FirstName = "Updated",
                    LastName = "Customer",
                    Email = "updated-customer@example.com",
                    PhoneNumber = "9123456789",
                    Address = "Updated Address",
                    City = "Mandi",
                    State = "Himachal Pradesh",
                    PostalCode = "175001",
                    IsActive = true
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            using var scope = factory.Services.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var customer = await db.Customers.SingleAsync(c => c.Id == customerId);

            Assert.Equal("Updated", customer.FirstName);
            Assert.Equal("updated-customer@example.com", customer.Email);
        }
    }

    [Fact]
    public async Task Update_WithNonExistingId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PutAsJsonAsync(
                $"/api/customers/{Guid.NewGuid()}",
                new
                {
                    FirstName = "Updated",
                    LastName = "Customer",
                    Email = "updated@example.com",
                    PhoneNumber = "9123456789",
                    IsActive = true
                });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithDuplicateEmail_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedCustomerAsync(factory, email: "existing@example.com");

            var customerId = await SeedCustomerAsync(factory);

            var response = await client.PutAsJsonAsync(
                $"/api/customers/{customerId}",
                new
                {
                    FirstName = "Updated",
                    LastName = "Customer",
                    Email = "existing@example.com",
                    PhoneNumber = "9123456789",
                    IsActive = true
                });

            Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithDuplicatePhone_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedCustomerAsync(factory, phone: "9876543210");

            var customerId = await SeedCustomerAsync(factory);

            var response = await client.PutAsJsonAsync(
                $"/api/customers/{customerId}",
                new
                {
                    FirstName = "Updated",
                    LastName = "Customer",
                    Email = "updated@example.com",
                    PhoneNumber = "9876543210",
                    IsActive = true
                });

            Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        }
    }

    [Fact]
    public async Task Delete_WithExistingCustomer_SoftDeletesCustomer()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var customerId = await SeedCustomerAsync(factory);

            var response = await client.DeleteAsync($"/api/customers/{customerId}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using var scope = factory.Services.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var customer = await db.Customers.SingleAsync(c => c.Id == customerId);

            Assert.False(customer.IsActive);
        }
    }

    [Fact]
    public async Task Delete_WithNonExistingId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.DeleteAsync($"/api/customers/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
