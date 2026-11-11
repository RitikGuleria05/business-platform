using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BusinessPlatform.Tests.Integration_Tests;

public sealed class BusinessPlatformWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public bool PermissionAllowed { get; private set; }

    public void SetPermissionResult(bool allowed)
    {
        PermissionAllowed = allowed;
    }

    public bool FailInventoryCreation { get; private set; }

    public void SetInventoryCreationFailure(bool fail)
    {
        FailInventoryCreation = fail;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "IntegrationTestKey-AtLeast32CharactersLong!",
                ["Jwt:Issuer"] = "BusinessPlatform",
                ["Jwt:Audience"] = "BusinessPlatformUsers"
            };

            configuration.AddInMemoryCollection(settings);
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            _connection.Open();

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            services.RemoveAll<IPermissionAuthorizationService>();

            services.AddScoped<IPermissionAuthorizationService>(
                _ => new TestPermissionAuthorizationService(
                    PermissionAllowed));

            if (FailInventoryCreation)
            {
                services.RemoveAll<IInventory_Main_Repository>();

                services.AddScoped<IInventory_Main_Repository, FailingInventoryRepository>();
            }
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection.Dispose();
        }
    }

    public async Task InitializeDatabaseAsync()
    {
        using var scope = Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.EnsureCreatedAsync();
    }
}
