using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Infrastructure.Repositories;
using BusinessPlatform.Infrastructure.Services;
using BusinessPlatform.Infrastructure.Security;
using BusinessPlatform.Application.Interfaces.Product_Module;
using BusinessPlatform.Infrastructure.Repositories.Product_Module;
using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Infrastructure.Repositories.Inventory_Module;
using BusinessPlatform.Application.Interfaces.Customer_Module;
using BusinessPlatform.Infrastructure.Repositories.Customer_Module;
using BusinessPlatform.Application.Interfaces.Sales_Module;
using BusinessPlatform.Infrastructure.Repositories.Sale_Module;
using BusinessPlatform.Application.Interfaces.Unit_of_Work;
using BusinessPlatform.Application.Interfaces.Reports;
using BusinessPlatform.Infrastructure.Repositories.Reports;

namespace BusinessPlatform.Infrastructure.Extensions
{
    public static class InfrastructureServiceExtensions
    {

        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {


            services.AddDbContext<AppDbContext>(options =>
            {

                var connectionString =
                    configuration.GetConnectionString("ConnStr");


                options.UseMySql(
                    connectionString,
                    ServerVersion.AutoDetect(connectionString)
                );

            });

            // Infrasrtucture layer service registoration
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ITokenService, JwtService>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IRefreshTokenRepository,RefreshTokenRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IModuleRepository, ModuleRepository>();

            // Product Module 
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();

            services.AddScoped<IInventory_Main_Repository, InventoryRepository>();

            services.AddScoped<ICustomerRepository, CustomerRepository>();

            services.AddScoped<ISaleRepository, SaleRepository>();
            services.AddScoped<ISaleReturnRepository, SaleReturnRepository>();
            // Requested return ≤ Sold quantity - Previously returned quantity
            // This is why we created SaleReturn and SaleReturnItem instead of simply changing the original sale.

            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // reports
            services.AddScoped<IReportRepository, ReportRepository>();

            return services;
        }

    }
}
