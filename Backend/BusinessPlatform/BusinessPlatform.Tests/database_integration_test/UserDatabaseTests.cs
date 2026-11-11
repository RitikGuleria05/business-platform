using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace BusinessPlatform.Tests.Integration_Tests.Database;

public class UserDatabaseTests
{
    private async Task<(BusinessPlatformWebApplicationFactory Factory, AppDbContext Db)> CreateDatabaseAsync()
    {
        var factory = new BusinessPlatformWebApplicationFactory();

        await factory.InitializeDatabaseAsync();

        var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return (factory, db);
    }

    [Fact]
    public async Task CreateUser_WithInvalidRoleId_ThrowsDbUpdateException()
    {
        var (factory, db) = await CreateDatabaseAsync();

        using (factory)
        using (db)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "TestUser",
                Email = "test@example.com",
                PasswordHash = "hashed-password",
                RoleId = Guid.NewGuid()
            };

            db.Users.Add(user);

            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }
    }

    [Fact]
    public async Task CreateUser_WithDuplicateEmail_ThrowsDbUpdateException()
    {
        var (factory, db) = await CreateDatabaseAsync();

        using (factory)
        using (db)
        {
            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin"
            };

            db.Roles.Add(role);

            db.Users.AddRange(
                new User
                {
                    Id = Guid.NewGuid(),
                    UserName = "UserOne",
                    Email = "same@example.com",
                    PasswordHash = "hash1",
                    RoleId = role.Id
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    UserName = "UserTwo",
                    Email = "same@example.com",
                    PasswordHash = "hash2",
                    RoleId = role.Id
                });

            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }
    }

    [Fact]
    public async Task CreateUser_WithValidRole_SavesSuccessfully()
    {
        var (factory, db) = await CreateDatabaseAsync();

        using (factory)
        using (db)
        {
            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "TestUser",
                Email = "valid@example.com",
                PasswordHash = "hashed-password",
                RoleId = role.Id
            };

            db.Roles.Add(role);
            db.Users.Add(user);

            await db.SaveChangesAsync();

            var savedUser = await db.Users
                .Include(x => x.Role)
                .SingleAsync(x => x.Id == user.Id);

            Assert.Equal("TestUser", savedUser.UserName);
            Assert.Equal("Admin", savedUser.Role.Name);
        }
    }

    [Fact]
    public async Task CreateUser_WithoutEmail_ThrowsDbUpdateException()
    {
        var (factory, db) = await CreateDatabaseAsync();

        using (factory)
        using (db)
        {
            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = "TestUser",
                Email = null!,
                PasswordHash = "hashed-password",
                RoleId = role.Id
            };

            db.Roles.Add(role);
            db.Users.Add(user);

            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }
    }

    [Fact]
    public async Task CreateUser_WithoutUserName_ThrowsDbUpdateException()
    {
        var (factory, db) = await CreateDatabaseAsync();

        using (factory)
        using (db)
        {
            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = null!,
                Email = "username-test@example.com",
                PasswordHash = "hashed-password",
                RoleId = role.Id
            };

            db.Roles.Add(role);
            db.Users.Add(user);

            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }

    }

    [Fact]
    public async Task DeleteRole_WithAssignedUsers_ThrowsInvalidOperationException()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        await factory.InitializeDatabaseAsync();

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "TestUser",
            Email = "test@example.com",
            PasswordHash = "hashed-password",
            RoleId = role.Id
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        // EF Core rejects the deletion because the role has assigned users.
        Assert.Throws<InvalidOperationException>(() =>
            db.Roles.Remove(role));

        // Verify that neither record was deleted.
        Assert.True(await db.Roles.AnyAsync(x => x.Id == role.Id));
        Assert.True(await db.Users.AnyAsync(x => x.Id == user.Id));
    }

    [Fact]
    public async Task DeleteUser_DeletesAssociatedRefreshTokens()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        await factory.InitializeDatabaseAsync();

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "TestUser",
            Email = "test@example.com",
            PasswordHash = "hashed-password",
            RoleId = role.Id
        };

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        db.Users.Remove(user);
        await db.SaveChangesAsync();

        Assert.False(await db.Users.AnyAsync(x => x.Id == user.Id));
        Assert.False(await db.RefreshTokens.AnyAsync(x => x.Id == refreshToken.Id));
    }

    [Fact]
    public async Task TransactionRollback_DoesNotSaveChanges()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        await factory.InitializeDatabaseAsync();

        var roleId = Guid.NewGuid();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await using var transaction = await db.Database.BeginTransactionAsync();

            db.Roles.Add(new Role
            {
                Id = roleId,
                Name = "TemporaryRole"
            });

            await db.SaveChangesAsync();

            await transaction.RollbackAsync();
        }

        using var verifyScope = factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.False(await verifyDb.Roles.AnyAsync(x => x.Id == roleId));
    }

    [Fact]
    public async Task TransactionCommit_SavesChangesPermanently()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        await factory.InitializeDatabaseAsync();

        var roleId = Guid.NewGuid();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await using var transaction = await db.Database.BeginTransactionAsync();

            db.Roles.Add(new Role
            {
                Id = roleId,
                Name = "CommittedRole"
            });

            await db.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        using var verifyScope = factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.True(await verifyDb.Roles.AnyAsync(x => x.Id == roleId));
    }

    [Fact]
    public async Task TransactionRollback_UndoesMultipleOperations()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        await factory.InitializeDatabaseAsync();

        var firstRoleId = Guid.NewGuid();
        var secondRoleId = Guid.NewGuid();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await using var transaction = await db.Database.BeginTransactionAsync();

            db.Roles.AddRange(
                new Role { Id = firstRoleId, Name = "TemporaryRole1" },
                new Role { Id = secondRoleId, Name = "TemporaryRole2" }
            );

            await db.SaveChangesAsync();
            await transaction.RollbackAsync();
        }

        using var verifyScope = factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        Assert.False(await verifyDb.Roles.AnyAsync(x => x.Id == firstRoleId));
        Assert.False(await verifyDb.Roles.AnyAsync(x => x.Id == secondRoleId));
    }
}