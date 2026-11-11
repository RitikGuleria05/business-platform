
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

public class CategoryControllerIntegrationTests
{
    private const string Password = "TestPassword123!";

    private async Task<(BusinessPlatformWebApplicationFactory Factory,
        HttpClient Client, Guid UserId)> CreateAuthenticatedClientAsync(
        bool permissionAllowed = true)
    {
        var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(permissionAllowed);

        await factory.InitializeDatabaseAsync();

        var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "CategoryTestUser",
            Email = $"category-{Guid.NewGuid():N}@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password),
            RoleId = role.Id,
            Role = role,
            IsActive = true
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        await db.SaveChangesAsync();
        scope.Dispose();

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

        return (factory, client, user.Id);
    }

    [Fact]
    public async Task GetAll_WithPermission_ReturnsOk()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/categories");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetAll_WithoutPermission_ReturnsForbidden()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync(false);

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/categories");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetById_WithExistingCategory_ReturnsOk()
    {
        var (factory, client, _) =  await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var categoryId = await SeedCategoryAsync( factory, "Electronics");

            var response = await client.GetAsync($"/api/categories/{categoryId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetById_WithNonExistingId_ReturnsNotFound()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync($"/api/categories/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithValidRequest_ReturnsCreated()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PostAsJsonAsync(
                "/api/categories",
                new
                {
                    Name = "Electronics",
                    Description = "Electronic products"
                });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();

            Assert.Equal("Electronics",result.GetProperty("name").GetString());
        }
    }

    [Fact]
    public async Task Create_WithDuplicateName_ReturnsBadRequest()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedCategoryAsync(factory, "Electronics");

            var response = await client.PostAsJsonAsync("/api/categories",
                new
                {
                    Name = "Electronics",
                    Description = "Duplicate category"
                });

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithValidRequest_ReturnsOk()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var categoryId = await SeedCategoryAsync(factory, "Electronics");

            var response = await client.PutAsJsonAsync($"/api/categories/{categoryId}",
                new
                {
                    Name = "Updated Electronics",
                    Description = "Updated description",
                    IsActive = true
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithNonExistingId_ReturnsNotFound()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PutAsJsonAsync(
                $"/api/categories/{Guid.NewGuid()}",
                new
                {
                    Name = "Updated Category",
                    Description = "Description",
                    IsActive = true
                });

            Assert.Equal(HttpStatusCode.NotFound,response.StatusCode);
        }
    }

    [Fact]
    public async Task Delete_WithExistingCategory_SoftDeletesCategory()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var categoryId = await SeedCategoryAsync(factory, "Electronics");

            var response = await client.DeleteAsync($"/api/categories/{categoryId}");

            Assert.Equal(HttpStatusCode.NoContent,response.StatusCode);

            using var scope = factory.Services.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var category = await db.Categories.SingleAsync(x => x.Id == categoryId);

            Assert.False(category.IsActive);
        }
    }

    [Fact]
    public async Task Delete_WithNonExistingId_ReturnsNotFound()
    {
        var (factory, client, _) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.DeleteAsync($"/api/categories/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound,response.StatusCode);
        }
    }

    private static async Task<Guid> SeedCategoryAsync(BusinessPlatformWebApplicationFactory factory, string name)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = "Test category",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();

        return category.Id;
    }
}
