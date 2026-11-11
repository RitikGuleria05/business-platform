using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BusinessPlatform.Application.DTOs.Role;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using BusinessPlatform.Tests.Integration_Tests;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class RoleControllerIntegrationTests
{
    // Reuse the CreateAuthenticatedClientAsync() helper
    // from your existing Sales integration tests.

    private const string Password = "Test@12345";

    private async Task<(BusinessPlatformWebApplicationFactory factory, HttpClient client)>
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
                UserName = "RoleTestUser",
                Email = $"role-{Guid.NewGuid():N}@example.com",
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
                new
                {
                    Email = user.Email,
                    Password
                });

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

    [Fact]
    public async Task GetAll_ReturnsOkWithRoles()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedRoleAsync(factory, "Manager");

            var response = await client.GetAsync("/api/role");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var roles = await response.Content
                .ReadFromJsonAsync<List<RoleResponse>>();

            Assert.NotNull(roles);
            Assert.Contains(roles, r => r.Name == "Manager");
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
                "/api/role",
                new CreateRoleRequest { Name = "Manager" });

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var role = await response.Content
                .ReadFromJsonAsync<RoleResponse>();

            Assert.NotNull(role);
            Assert.NotEqual(Guid.Empty, role.Id);
            Assert.Equal("Manager", role.Name);

            var savedRole = await GetRoleFromDatabaseAsync(
                factory, role.Id);

            Assert.NotNull(savedRole);
            Assert.Equal("Manager", savedRole.Name);
        }
    }

    [Fact]
    public async Task Create_WithDuplicateName_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            await SeedRoleAsync(factory, "Manager");

            var response = await client.PostAsJsonAsync(
                "/api/role",
                new CreateRoleRequest { Name = "Manager" });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task GetById_WithExistingRole_ReturnsOk()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");

            var response = await client.GetAsync(
                $"/api/role/{roleId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var role = await response.Content
                .ReadFromJsonAsync<RoleResponse>();

            Assert.NotNull(role);
            Assert.Equal(roleId, role.Id);
            Assert.Equal("Manager", role.Name);
        }
    }

    [Fact]
    public async Task GetById_WithInvalidId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync(
                $"/api/roles/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithValidRequest_ReturnsOkAndUpdatesRole()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");

            var response = await client.PutAsJsonAsync(
                $"/api/role/{roleId}",
                new UpdateRoleRequest { Name = "Supervisor" });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedRole = await GetRoleFromDatabaseAsync(
                factory, roleId);

            Assert.NotNull(updatedRole);
            Assert.Equal("Supervisor", updatedRole.Name);
        }
    }

    [Fact]
    public async Task Update_WithDuplicateName_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");
            await SeedRoleAsync(factory, "Supervisor");

            var response = await client.PutAsJsonAsync(
                $"/api/role/{roleId}",
                new UpdateRoleRequest { Name = "Supervisor" });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task Update_WithInvalidId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.PutAsJsonAsync(
                $"/api/roles/{Guid.NewGuid()}",
                new UpdateRoleRequest { Name = "Supervisor" });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task Delete_WithCustomRole_ReturnsNoContent()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");

            var response = await client.DeleteAsync(
                $"/api/role/{roleId}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            var deletedRole = await GetRoleFromDatabaseAsync(
                factory, roleId);

            Assert.Null(deletedRole);
        }
    }

    [Fact]
    public async Task Delete_WithInvalidId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.DeleteAsync(
                $"/api/roles/{Guid.NewGuid()}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("Employee")]
    public async Task Delete_WithProtectedRole_ReturnsBadRequest(
      string roleName)
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            if (roleName == "Employee")
            {
                await SeedRoleAsync(factory, "Employee");
            }

            var roleId = await GetRoleIdByNameAsync(
                factory, roleName);

            var response = await client.DeleteAsync(
                $"/api/role/{roleId}");

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);

            var role = await GetRoleFromDatabaseAsync(
                factory, roleId);

            Assert.NotNull(role);
        }
    }

    [Fact]
    public async Task GetPermissions_ReturnsAssignedPermissions()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");
            var permissionIds = await SeedPermissionsAsync(factory);

            await AssignPermissionsDirectlyAsync(
                factory, roleId, permissionIds);

            var response = await client.GetAsync(
                $"/api/role/{roleId}/permissions");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var permissions = await response.Content
                .ReadFromJsonAsync<List<PermissionResponse>>();

            Assert.NotNull(permissions);
            Assert.Equal(2, permissions.Count);

            foreach (var permissionId in permissionIds)
            {
                Assert.Contains(
                    permissions,
                    p => p.Id == permissionId);
            }
        }
    }

    [Fact]
    public async Task GetPermissions_WithInvalidRoleId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var response = await client.GetAsync(
                $"/api/roles/{Guid.NewGuid()}/permissions");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task AssignPermissions_WithValidIds_SavesPermissions()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");
            var permissionIds = await SeedPermissionsAsync(factory);

            var response = await client.PostAsJsonAsync(
                $"/api/role/{roleId}/permissions",
                new AssignPermissionsRequest
                {
                    PermissionIds = permissionIds
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var savedPermissions = await GetRolePermissionIdsAsync(
                factory, roleId);

            Assert.Equal(2, savedPermissions.Count);

            foreach (var permissionId in permissionIds)
            {
                Assert.Contains(permissionId, savedPermissions);
            }
        }
    }

    [Fact]
    public async Task AssignPermissions_WithInvalidPermissionId_ReturnsBadRequest()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");

            var response = await client.PostAsJsonAsync(
                $"/api/role/{roleId}/permissions",
                new AssignPermissionsRequest
                {
                    PermissionIds = new List<Guid>
                    {
                        Guid.NewGuid()
                    }
                });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    [Fact]
    public async Task AssignPermissions_WithInvalidRoleId_ReturnsNotFound()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var permissionIds = await SeedPermissionsAsync(factory);

            var response = await client.PostAsJsonAsync(
                $"/api/roles/{Guid.NewGuid()}/permissions",
                new AssignPermissionsRequest
                {
                    PermissionIds = permissionIds
                });

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public async Task AssignPermissions_ReplacesExistingPermissions()
    {
        var (factory, client) = await CreateAuthenticatedClientAsync();

        using (factory)
        using (client)
        {
            var roleId = await SeedRoleAsync(factory, "Manager");
            var permissionIds = await SeedPermissionsAsync(factory);

            await AssignPermissionsDirectlyAsync(
                factory,
                roleId,
                new List<Guid> { permissionIds[0] });

            var response = await client.PostAsJsonAsync(
                $"/api/role/{roleId}/permissions",
                new AssignPermissionsRequest
                {
                    PermissionIds = new List<Guid>
                    {
                        permissionIds[1]
                    }
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var savedIds = await GetRolePermissionIdsAsync(
                factory, roleId);

            Assert.Single(savedIds);
            Assert.Equal(permissionIds[1], savedIds[0]);
        }
    }

    // -------------------- Database seed helpers --------------------

    private static async Task<Guid> SeedRoleAsync(
        BusinessPlatformWebApplicationFactory factory,
        string name)
    {
        var roleId = Guid.NewGuid();

        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        db.Roles.Add(new Role
        {
            Id = roleId,
            Name = name
        });

        await db.SaveChangesAsync();

        return roleId;
    }

    private static async Task<Guid> GetRoleIdByNameAsync(
        BusinessPlatformWebApplicationFactory factory,
        string roleName)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        var role = await db.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Name == roleName);

        Assert.NotNull(role);

        return role.Id;
    }

    private static async Task<List<Guid>> SeedPermissionsAsync(
        BusinessPlatformWebApplicationFactory factory)
    {
        var moduleId = Guid.NewGuid();

        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        db.Modules.Add(new Module
        {
            Id = moduleId,
            Name = "Testing"
        });

        var permissions = new List<Permission>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "testing.read",
                ModuleId = moduleId
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "testing.write",
                ModuleId = moduleId
            }
        };

        db.Permissions.AddRange(permissions);

        await db.SaveChangesAsync();

        return permissions.Select(p => p.Id).ToList();
    }

    private static async Task AssignPermissionsDirectlyAsync(
        BusinessPlatformWebApplicationFactory factory,
        Guid roleId,
        List<Guid> permissionIds)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        foreach (var permissionId in permissionIds)
        {
            db.RolePermissions.Add(new RolePermission
            {
                Id = Guid.NewGuid(),
                RoleId = roleId,
                PermissionId = permissionId
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task<List<Guid>> GetRolePermissionIdsAsync(
        BusinessPlatformWebApplicationFactory factory,
        Guid roleId)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        return await db.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.PermissionId)
            .ToListAsync();
    }

    private static async Task<Role?> GetRoleFromDatabaseAsync(
        BusinessPlatformWebApplicationFactory factory,
        Guid roleId)
    {
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        return await db.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == roleId);
    }

    // Keep your existing CreateAuthenticatedClientAsync()
    // implementation from Sales integration tests here.
}