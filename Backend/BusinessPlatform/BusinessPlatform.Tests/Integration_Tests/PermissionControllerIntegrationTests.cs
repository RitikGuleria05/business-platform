using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BusinessPlatform.Application.DTOs.Permission;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;


public class PermissionControllerIntegrationTests
{
    private const string Password = "Test@12345";
    private const string BaseUrl = "/api/permission";

    private async Task<(BusinessPlatformWebApplicationFactory Factory,HttpClient Client,Guid ModuleId)>
        CreateAuthenticatedClientAsync(bool permissionAllowed = true)
    {
        var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(permissionAllowed);

        await factory.InitializeDatabaseAsync();

        Guid moduleId;

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
                UserName = "PermissionTestUser",
                Email = $"permission-{Guid.NewGuid():N}@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password),
                RoleId = role.Id,
                Role = role,
                IsActive = true
            };

            var module = new Module
            {
                Id = Guid.NewGuid(),
                Name = "Products",
                Description = "Product management"
            };

            db.Roles.Add(role);
            db.Users.Add(user);
            db.Modules.Add(module);

            await db.SaveChangesAsync();

            moduleId = module.Id;

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

            return (factory, client, moduleId);
        }
    }

    private async Task<Guid> SeedPermissionAsync(
        AppDbContext db,
        Guid moduleId,
        string name = "product.read")
    {
        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Name = name,
            ModuleId = moduleId
        };

        db.Permissions.Add(permission);
        await db.SaveChangesAsync();

        return permission.Id;
    }

    // GET ALL

    [Fact]
    public async Task GetAll_ShouldReturnOk()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await SeedPermissionAsync(db, moduleId, "product.read");
                await SeedPermissionAsync(db, moduleId, "product.write");
            }

            var response = await client.GetAsync(BaseUrl);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var permissions =
                await response.Content.ReadFromJsonAsync<List<PermissionResponse>>();

            Assert.NotNull(permissions);
            Assert.Equal(2, permissions.Count);
        }
    }

    // GET BY ID

    [Fact]
    public async Task GetById_WithValidId_ShouldReturnOk()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid permissionId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                permissionId = await SeedPermissionAsync(db, moduleId);
            }

            var response = await client.GetAsync($"{BaseUrl}/{permissionId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var permission =
                await response.Content.ReadFromJsonAsync<PermissionResponse>();

            Assert.NotNull(permission);
            Assert.Equal(permissionId, permission.Id);
            Assert.Equal("product.read", permission.Name);
            Assert.Equal(moduleId, permission.ModuleId);
        }
    }

    [Fact]
    public async Task GetById_WithInvalidId_ShouldReturnNotFound()
    {
        var (factory, client, _) =
            await CreateAuthenticatedClientAsync();

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
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var request = new CreatePermissionRequest
            {
                Name = "product.write",
                ModuleId = moduleId
            };

            var response = await client.PostAsJsonAsync(BaseUrl, request);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var permission =
                await response.Content.ReadFromJsonAsync<PermissionResponse>();

            Assert.NotNull(permission);
            Assert.Equal("product.write", permission.Name);
            Assert.Equal(moduleId, permission.ModuleId);
        }
    }

    [Fact]
    public async Task Create_WithDuplicateName_ShouldReturnBadRequest()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await SeedPermissionAsync(db, moduleId, "product.read");
            }

            var request = new CreatePermissionRequest
            {
                Name = "product.read",
                ModuleId = moduleId
            };

            var response = await client.PostAsJsonAsync(BaseUrl, request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Create_WithInvalidModuleId_ShouldReturnNotFound()
    {
        var (factory, client, _) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var request = new CreatePermissionRequest
            {
                Name = "product.read",
                ModuleId = Guid.NewGuid()
            };

            var response = await client.PostAsJsonAsync(BaseUrl, request);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // UPDATE

    [Fact]
    public async Task Update_WithValidRequest_ShouldReturnOk()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid permissionId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                permissionId = await SeedPermissionAsync(
                    db, moduleId, "product.read");
            }

            var request = new UpdatePermissionRequest
            {
                Name = "product.write",
                ModuleId = moduleId
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{permissionId}", request);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var permission =
                await response.Content.ReadFromJsonAsync<PermissionResponse>();

            Assert.NotNull(permission);
            Assert.Equal(permissionId, permission.Id);
            Assert.Equal("product.write", permission.Name);
        }
    }

    [Fact]
    public async Task Update_WithInvalidId_ShouldReturnNotFound()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var request = new UpdatePermissionRequest
            {
                Name = "product.write",
                ModuleId = moduleId
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{Guid.NewGuid()}", request);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithDuplicateName_ShouldReturnBadRequest()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid firstPermissionId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                firstPermissionId = await SeedPermissionAsync(
                    db, moduleId, "product.read");

                await SeedPermissionAsync(db, moduleId, "product.write");
            }

            var request = new UpdatePermissionRequest
            {
                Name = "product.write",
                ModuleId = moduleId
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{firstPermissionId}", request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithInvalidModuleId_ShouldReturnNotFound()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid permissionId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                permissionId = await SeedPermissionAsync(db, moduleId);
            }

            var request = new UpdatePermissionRequest
            {
                Name = "product.write",
                ModuleId = Guid.NewGuid()
            };

            var response = await client.PutAsJsonAsync(
                $"{BaseUrl}/{permissionId}", request);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    // DELETE

    [Fact]
    public async Task Delete_WithValidId_ShouldReturnNoContent()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            Guid permissionId;

            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                permissionId = await SeedPermissionAsync(db, moduleId);
            }

            var response = await client.DeleteAsync(
                $"{BaseUrl}/{permissionId}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using var scopeAfterDelete = factory.Services.CreateScope();

            var dbAfterDelete =
                scopeAfterDelete.ServiceProvider.GetRequiredService<AppDbContext>();

            var deletedPermission = await dbAfterDelete.Permissions
                .FirstOrDefaultAsync(x => x.Id == permissionId);

            Assert.Null(deletedPermission);
        }
    }

    [Fact]
    public async Task Delete_WithInvalidId_ShouldReturnNotFound()
    {
        var (factory, client, _) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.DeleteAsync(
                $"{BaseUrl}/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Delete_WhenAssignedToRole_ShouldReturnBadRequest()
    {
        var (factory, client, moduleId) =
            await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var permissionId = await SeedPermissionAsync(db, moduleId);

                var role = new Role
                {
                    Id = Guid.NewGuid(),
                    Name = "Employee"
                };

                db.Roles.Add(role);

                db.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permissionId
                });

                await db.SaveChangesAsync();

                var response = await client.DeleteAsync(
                    $"{BaseUrl}/{permissionId}");

                Assert.Equal(
                    HttpStatusCode.BadRequest,
                    response.StatusCode);
            }
        }
    }
}
