using BusinessPlatform.Application.Interfaces.Reports;
using BusinessPlatform.Application.Services;
using BusinessPlatform.Application.Services.Customer_Module;
using BusinessPlatform.Application.Services.Inventory_Module;
using BusinessPlatform.Application.Services.Product_Module;
using BusinessPlatform.Application.Services.Reports_Service;
using BusinessPlatform.Application.Services.Sale_Module;
using Microsoft.Extensions.DependencyInjection;

namespace BusinessPlatform.Application.Extensions
{
    public static class ApplicationServiceExtensions
    {
        // for the learning purpose i mannaly done the mapping but further i will use the auto mapper in services and where it is needed.
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
        {

            services.AddScoped<AuthService>();
            services.AddScoped<RoleService>();
            services.AddScoped<ModuleService>();

            // Product Services
            services.AddScoped<CategoryService>();
            services.AddScoped<ProductService>();

            // Inventory Service
            services.AddScoped<InventoryService>();

            // Customer Service
            services.AddScoped<CustomerService>();

            // Sale Services
            services.AddScoped<SaleService>();
            services.AddScoped<SaleReturnService>();

            // reports
            services.AddScoped<ReportService>();

            return services;

        }

    }
}
