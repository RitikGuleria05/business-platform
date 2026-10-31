
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BusinessPlatform.Tests.Integration_Tests;

public sealed class BusinessPlatformWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName =
        $"BusinessPlatformTests_{Guid.NewGuid():N}";

    public bool PermissionAllowed { get; private set; }

    public void SetPermissionResult(bool allowed)
    {
        PermissionAllowed = allowed;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["Jwt:Key"] =
                    "IntegrationTestKey-AtLeast32CharactersLong!",
                ["Jwt:Issuer"] = "BusinessPlatform",
                ["Jwt:Audience"] = "BusinessPlatformUsers"
            };

            configuration.AddInMemoryCollection(settings);
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);

                options.ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning));
            });

            services.RemoveAll<IPermissionAuthorizationService>();

            services.AddScoped<IPermissionAuthorizationService>(
                _ => new TestPermissionAuthorizationService(
                    PermissionAllowed));
        });
    }
}
