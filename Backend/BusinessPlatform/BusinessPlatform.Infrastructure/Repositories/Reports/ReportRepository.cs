using BusinessPlatform.Application.DTOs.Reports;
using BusinessPlatform.Application.Interfaces.Reports;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Infrastructure.Repositories.Reports
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;

        public ReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryResponse> GetDashboardSummaryAsync()
        {
            var totalOrders =  await _context.Sales.CountAsync(x => x.Status != Domain.Enums.SaleStatus.Cancelled);

            var totalRevenue = await _context.Sales.Where(x => x.Status != Domain.Enums.SaleStatus.Cancelled).SumAsync(x => (decimal?)x.GrandTotal) ?? 0;

            var totalCustomers = await _context.Customers.CountAsync(x => x.IsActive);

            var totalProducts = await _context.Products.CountAsync(x => x.IsActive);

            var lowStockProducts = await _context.Inventories.CountAsync(x => x.QuantityInStock > 0 && x.QuantityInStock <= x.ReorderLevel);

            var outOfStockProducts =  await _context.Inventories.CountAsync(x => x.QuantityInStock <= 0);

            return new DashboardSummaryResponse
            {
                TotalOrders = totalOrders,

                TotalRevenue = totalRevenue,

                TotalCustomers = totalCustomers,

                TotalProducts = totalProducts,

                LowStockProducts = lowStockProducts,

                OutOfStockProducts = outOfStockProducts
            };
        }

        public async Task<List<TopProductResponse>> GetTopProductsAsync(int count)
        {
            return await _context.SaleItems.Where(x => x.Sale.Status != Domain.Enums.SaleStatus.Cancelled)
                .GroupBy(x => new
                {
                    x.ProductId,
                    x.Product.Name
                })
                .Select(x => new TopProductResponse
                {
                    ProductId = x.Key.ProductId,

                    ProductName = x.Key.Name,

                    QuantitySold = x.Sum(i => i.Quantity),

                    Revenue = x.Sum(i => i.Total)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<SalesTrendResponse>> GetSalesTrendAsync(DateTime from,DateTime to)
        {
            return await _context.Sales.Where(x => x.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.SaleDate >= from && x.SaleDate <= to)
                .GroupBy(x => x.SaleDate.Date)
                .Select(x => new SalesTrendResponse
                {
                    Date = x.Key,

                    Orders = x.Count(),

                    Revenue =
                        x.Sum(s => s.GrandTotal)
                }).OrderBy(x => x.Date).ToListAsync();
        }
    }
}
