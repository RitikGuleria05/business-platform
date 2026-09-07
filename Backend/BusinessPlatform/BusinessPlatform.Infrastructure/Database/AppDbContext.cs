using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database.Configurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Infrastructure.Database
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(
        DbContextOptions<AppDbContext> options
        )
        : base(options)
        {

        }

        public DbSet<User> Users => Set<User>();

        public DbSet<Role> Roles => Set<Role>();

        public DbSet<Permission> Permissions => Set<Permission>();

        public DbSet<Module> Modules => Set<Module>();

        public DbSet<Employee> Employees => Set<Employee>();

        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        // Product Module

        public DbSet<Category> Categories => Set<Category>();

        public DbSet<Product> Products => Set<Product>();

        public DbSet<Inventory> Inventories => Set<Inventory>();
        public DbSet<Customer> Customers => Set<Customer>();

        public DbSet<Sale> Sales => Set<Sale>();

        public DbSet<SaleItem> SaleItems => Set<SaleItem>();

        public DbSet<SaleReturn> SaleReturns => Set<SaleReturn>();

        public DbSet<SaleReturnItem> SaleReturnItems => Set<SaleReturnItem>();

        public DbSet<Payment> Payments => Set<Payment>();


        protected override void OnModelCreating(ModelBuilder builder)
        {

            base.OnModelCreating(builder);

            // with the help of this i dont need to add configration classes mannually
            builder.ApplyConfigurationsFromAssembly(
                typeof(AppDbContext).Assembly
            );

        }

    }
}
