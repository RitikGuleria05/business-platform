using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BusinessPlatform.Application.DTOs.Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class ModuleControllerIntegrationTests
{
    private const string Password = "Test@12345";
    private const string BaseUrl = "/api/module";

    private async Task<(BusinessPlatformWebApplicationFactory Factory,HttpClient Client)> CreateAuthenticatedClientAsync()
    {
        var factory = new BusinessPlatformWebApplicationFactory();

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
                UserName = "ModuleTestUser",
                Email = $"module-{Guid.NewGuid():N}@example.com",
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

    private async Task<Guid> SeedModuleAsync(AppDbContext db,string name = "Products",string? description = "Product management")
    {
        var module = new Module
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description
        };

        db.Modules.Add(module);
        await db.SaveChangesAsync();

        return module.Id;
    }

    // GET ALL

    [Fact]
    public async Task GetAll_ShouldReturnOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await SeedModuleAsync(db, "Products");
                await SeedModuleAsync(db, "Sales");
            }

            var response = await client.GetAsync(BaseUrl);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var modules =
                await response.Content.ReadFromJsonAsync<List<ModuleResponse>>();

            Assert.NotNull(modules);
            Assert.Equal(2, modules.Count);
        }
    }

    // GET BY ID

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid moduleId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                moduleId = await SeedModuleAsync(
                    db, "Products", "Product management");
            }

            var response = await client.GetAsync($"{BaseUrl}/{moduleId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var module =
                await response.Content.ReadFromJsonAsync<ModuleResponse>();

            Assert.NotNull(module);
            Assert.Equal(moduleId, module.Id);
            Assert.Equal("Products", module.Name);
            Assert.Equal("Product management", module.Description);
        }
    }

    [Fact]
    public async Task GetById_WithInvalidId_ShouldReturnNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync(
                $"{BaseUrl}/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // CREATE

    [Fact]
    public async Task Create_WithValidRequest_ShouldReturnCreated()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var request = new CreateModuleRequest
            {
                Name = "Inventory",
                Description = "Inventory management"
            };

            var response = await client.PostAsJsonAsync(BaseUrl, request);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var module =
                await response.Content.ReadFromJsonAsync<ModuleResponse>();

            Assert.NotNull(module);
            Assert.NotEqual(Guid.Empty, module.Id);
            Assert.Equal("Inventory", module.Name);
            Assert.Equal("Inventory management", module.Description);
        }
    }

    [Fact]
    public async Task Create_WithDuplicateName_ShouldReturnBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await SeedModuleAsync(db, "Products");
            }

            var request = new CreateModuleRequest
            {
                Name = "Products",
                Description = "Another description"
            };

            var response = await client.PostAsJsonAsync(BaseUrl, request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithEmptyName_ShouldReturnBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var request = new CreateModuleRequest
            {
                Name = string.Empty,
                Description = "Invalid module"
            };

            var response = await client.PostAsJsonAsync(BaseUrl, request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    // UPDATE

    [Fact]
    public async Task Update_WithValidRequest_ShouldReturnOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid moduleId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                moduleId = await SeedModuleAsync(db, "Products");
            }

            var request = new UpdateModuleRequest
            {
                Name = "Product Management",
                Description = "Updated product module"
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{moduleId}", request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var module =
                await response.Content.ReadFromJsonAsync<ModuleResponse>();

            Assert.NotNull(module);
            Assert.Equal(moduleId, module.Id);
            Assert.Equal("Product Management", module.Name);
            Assert.Equal("Updated product module", module.Description);
        }
    }

    [Fact]
    public async Task Update_WithInvalidId_ShouldReturnNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var request = new UpdateModuleRequest
            {
                Name = "Updated Module",
                Description = "Updated description"
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{Guid.NewGuid()}", request);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithDuplicateName_ShouldReturnBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid firstModuleId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                firstModuleId = await SeedModuleAsync(db, "Products");
                await SeedModuleAsync(db, "Sales");
            }

            var request = new UpdateModuleRequest
            {
                Name = "Sales",
                Description = "Updated description"
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{firstModuleId}", request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    // DELETE

    [Fact]
    public async Task Delete_WithValidId_ShouldReturnNoContent()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid moduleId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                moduleId = await SeedModuleAsync(db);
            }

            var response = await client.DeleteAsync($"{BaseUrl}/{moduleId}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using var verifyScope = factory.Services.CreateScope();

            var verifyDb =
                verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

            var deletedModule = await verifyDb.Modules
                .FirstOrDefaultAsync(x => x.Id == moduleId);

            Assert.Null(deletedModule);
        }
    }

    [Fact]
    public async Task Delete_WithInvalidId_ShouldReturnNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.DeleteAsync(
                $"{BaseUrl}/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Delete_WhenModuleHasPermissions_ShouldReturnBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid moduleId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                moduleId = await SeedModuleAsync(db);

                db.Permissions.Add(new Permission
                {
                    Id = Guid.NewGuid(),
                    Name = "product.read",
                    ModuleId = moduleId
                });

                await db.SaveChangesAsync();
            }

            var response = await client.DeleteAsync(
                $"{BaseUrl}/{moduleId}");

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }
    }
}
