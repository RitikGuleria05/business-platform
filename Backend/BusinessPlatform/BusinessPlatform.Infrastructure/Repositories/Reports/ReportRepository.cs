using BusinessPlatform.Application.DTOs.Reports;
using BusinessPlatform.Application.DTOs.Reports.Products;
using BusinessPlatform.Application.DTOs.Reports.Sales;
using BusinessPlatform.Application.Interfaces.Common;
using BusinessPlatform.Application.Interfaces.Reports;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories.Reports
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;
        private readonly IAppClock _clock;

        public ReportRepository(AppDbContext context, IAppClock clock)
        {
            _context = context;
            _clock = clock;
        }

        public async Task<DashboardSummaryResponse> GetDashboardSummaryAsync()
        {
            var businessToday = _clock.BusinessToday;

            var fromUtc = _clock.ToUtc(businessToday);
            var toUtc = _clock.ToUtc(businessToday.AddDays(1));

            var todaySalesQuery = _context.Sales
                .Where(x =>
                    x.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.SaleDate >= fromUtc &&
                    x.SaleDate < toUtc);

            var todaySales = await todaySalesQuery
                .SumAsync(x => (decimal?)x.GrandTotal) ?? 0;

            var todayOrders = await todaySalesQuery.CountAsync();

            var todayReturns = await _context.SaleReturns
                .Where(x =>
                    x.Status == Domain.Enums.ReturnStatus.Completed &&
                    x.ReturnDate >= fromUtc &&
                    x.ReturnDate < toUtc)
                .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

            var totalCustomers = await _context.Customers
                .CountAsync(x => x.IsActive);

            var totalProducts = await _context.Products
                .CountAsync(x => x.IsActive);

            var lowStockProducts = await _context.Inventories
                .CountAsync(x =>
                    x.QuantityInStock > 0 &&
                    x.QuantityInStock <= x.ReorderLevel);

            var outOfStockProducts = await _context.Inventories
                .CountAsync(x => x.QuantityInStock <= 0);

            return new DashboardSummaryResponse
            {
                TodaySales = todaySales,
                TodayOrders = todayOrders,
                TodayReturns = todayReturns,
                TotalCustomers = totalCustomers,
                TotalProducts = totalProducts,
                LowStockProducts = lowStockProducts,
                OutOfStockProducts = outOfStockProducts
            };
        }

        public async Task<List<TopProductResponse>> GetTopProductsAsync(int count)
        {
            var sales = await _context.SaleItems.Where(x => x.Sale.Status != Domain.Enums.SaleStatus.Cancelled)
                .GroupBy(x => new
                {
                    x.ProductId,
                    x.Product.Name
                })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    QuantitySold = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.Total)
                })
                .ToListAsync();

            var returns = await _context.SaleReturnItems.Where(x => x.SaleReturn.Status == Domain.Enums.ReturnStatus.Completed)
                .GroupBy(x => new
                {
                    x.ProductId
                })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    QuantityReturned = g.Sum(x => x.Quantity),
                    ReturnAmount = g.Sum(x => x.Total)
                }).ToListAsync();

            var returnLookup = returns.ToDictionary(x => x.ProductId);

            return sales.Select(x =>
            {
                returnLookup.TryGetValue(x.ProductId, out var returned);

                var quantityReturned = returned?.QuantityReturned ?? 0;

                var returnAmount = returned?.ReturnAmount ?? 0;

                return new TopProductResponse
                {
                    ProductId = x.ProductId,
                    ProductName = x.ProductName,

                    QuantitySold = Math.Max(0, x.QuantitySold - quantityReturned),

                    Revenue = Math.Max(0, x.Revenue - returnAmount)
                };
            })
                .Where(x => x.QuantitySold > 0)
                .OrderByDescending(x => x.QuantitySold)
                .ThenByDescending(x => x.Revenue)
                .Take(count)
                .ToList();
        }

        public async Task<List<SalesTrendResponse>> GetSalesTrendAsync(DateTime from, DateTime to)
        {
            var fromBusiness = from.Date;
            var toBusinessExclusive = to.Date.AddDays(1);

            var fromUtc = _clock.ToUtc(fromBusiness);
            var toUtc = _clock.ToUtc(toBusinessExclusive);

            var sales = await _context.Sales.Where(x =>
                    x.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.SaleDate >= fromUtc &&
                    x.SaleDate < toUtc)
                .Select(x => new
                {
                    x.SaleDate,
                    x.GrandTotal
                }).ToListAsync();

            return sales
                .GroupBy(x => _clock.ToBusinessTime(x.SaleDate).Date)
                .Select(g => new SalesTrendResponse
                {
                    Date = g.Key,
                    Orders = g.Count(),
                    Revenue = g.Sum(x => x.GrandTotal)
                })
                .OrderBy(x => x.Date)
                .ToList();
        }

        public async Task<SalesReportResponse> GetSalesReportAsync(DateTime from, DateTime to)
        {
            var fromBusiness = from.Date;
            var toBusinessExclusive = to.Date.AddDays(1);

            var fromUtc = _clock.ToUtc(fromBusiness);
            var toUtc = _clock.ToUtc(toBusinessExclusive);

            // -----------------------------
            // SALES
            // -----------------------------

            var saleItemCount = await _context.SaleItems.CountAsync();

            var matchingSaleItemCount = await _context.SaleItems
                .Where(x =>
                    x.Sale.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.Sale.SaleDate >= fromUtc &&
                    x.Sale.SaleDate < toUtc)
                .CountAsync();

            var sales = await _context.Sales
                .Where(x =>
                    x.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.SaleDate >= fromUtc &&
                    x.SaleDate < toUtc)
                .Select(x => new
                {
                    x.Id,
                    x.InvoiceNumber,
                    x.SaleDate,
                    CustomerName = x.Customer.FirstName + " " + x.Customer.LastName,
                    x.SubTotal,
                    x.Discount,
                    x.Tax,
                    x.GrandTotal,
                    x.PaymentStatus
                })
                .OrderByDescending(x => x.SaleDate)
                .ToListAsync();

            // -----------------------------
            // RETURNS
            // -----------------------------

            var totalReturns = await _context.SaleReturns
                .Where(x =>
                    x.Status == Domain.Enums.ReturnStatus.Completed &&
                    x.ReturnDate >= fromUtc &&
                    x.ReturnDate < toUtc)
                .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

            // -----------------------------
            // SUMMARY
            // -----------------------------

            var grossSales = sales.Sum(x => x.GrandTotal);

            var totalOrders = sales.Count;

            var netSales = Math.Max(0, grossSales - totalReturns);

            var averageOrderValue = totalOrders == 0 ? 0 : netSales / totalOrders;

            // -----------------------------
            // RESPONSE
            // -----------------------------

            return new SalesReportResponse
            {
                GrossSales = grossSales,

                TotalReturns = totalReturns,

                NetSales = netSales,

                TotalOrders = totalOrders,

                AverageOrderValue = averageOrderValue,

                Sales = sales.Select(x => new SalesReportItemResponse
                {
                    SaleId = x.Id,

                    InvoiceNumber = x.InvoiceNumber,

                    SaleDate = _clock.ToBusinessTime(x.SaleDate),

                    CustomerName = x.CustomerName.Trim(),

                    SubTotal = x.SubTotal,

                    Discount = x.Discount,

                    Tax = x.Tax,

                    GrandTotal = x.GrandTotal,

                    PaymentStatus = x.PaymentStatus.ToString()
                }).ToList()
            };
        }

        public async Task<ProductReportResponse> GetProductReportAsync(DateTime from, DateTime to)
        {
            var fromBusiness = from.Date;
            var toBusinessExclusive = to.Date.AddDays(1);

            var fromUtc = _clock.ToUtc(fromBusiness);
            var toUtc = _clock.ToUtc(toBusinessExclusive);

            // --------------------------------
            // PRODUCTS
            // --------------------------------

            var products = await _context.Products
                .Where(x => x.IsActive)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.SKU,
                    CategoryName = x.Category.Name,

                    CurrentStock = _context.Inventories
                        .Where(i => i.ProductId == x.Id)
                        .Select(i => i.QuantityInStock)
                        .FirstOrDefault()
                }).ToListAsync();

            // --------------------------------
            // SALES
            // --------------------------------

            var sales = await _context.SaleItems
                .Where(x =>
                    x.Sale.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.Sale.SaleDate >= fromUtc &&
                    x.Sale.SaleDate < toUtc)
                .GroupBy(x => x.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,

                    QuantitySold = g.Sum(x => x.Quantity),

                    GrossRevenue = g.Sum(x => x.Total)
                }).ToListAsync();


            // --------------------------------
            // RETURNS
            // --------------------------------

            var returns = await _context.SaleReturnItems
                .Where(x => x.SaleReturn.Status == Domain.Enums.ReturnStatus.Completed &&
                    x.SaleReturn.ReturnDate >= fromUtc &&
                    x.SaleReturn.ReturnDate < toUtc)
                .GroupBy(x => x.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,

                    QuantityReturned = g.Sum(x => x.Quantity),

                    ReturnAmount = g.Sum(x => x.Total)
                }).ToListAsync();

            // --------------------------------
            // LOOKUPS
            // --------------------------------

            var salesLookup = sales.ToDictionary(x => x.ProductId);

            var returnsLookup = returns.ToDictionary(x => x.ProductId);

            // --------------------------------
            // BUILD REPORT
            // --------------------------------

            var result = products
                .Select(product =>
                {
                    salesLookup.TryGetValue(product.Id, out var sale);

                    returnsLookup.TryGetValue(product.Id, out var returned);

                    var quantitySold = sale?.QuantitySold ?? 0;

                    var grossRevenue = sale?.GrossRevenue ?? 0;

                    var quantityReturned = returned?.QuantityReturned ?? 0;

                    var returnAmount = returned?.ReturnAmount ?? 0;

                    return new ProductReportItemResponse
                    {
                        ProductId = product.Id,

                        ProductName = product.Name,

                        SKU = product.SKU,

                        CategoryName = product.CategoryName,

                        CurrentStock = product.CurrentStock,

                        QuantitySold = quantitySold,

                        GrossRevenue = grossRevenue,

                        QuantityReturned = quantityReturned,

                        ReturnAmount = returnAmount,

                        NetQuantitySold = Math.Max(0, quantitySold - quantityReturned),

                        NetRevenue = Math.Max(0, grossRevenue - returnAmount)
                    };
                }).OrderByDescending(x => x.NetRevenue).ToList();

            return new ProductReportResponse
            {
                From = fromBusiness,

                To = fromBusiness == to.Date ? fromBusiness : to.Date,

                Products = result
            };
        }

        public async Task<InventoryReportResponse> GetInventoryReportAsync()
        {
            // 1. Get inventory records directly
            var inventories = await _context.Inventories.ToListAsync();

            // 2. Get active products separately
            var productIds = inventories
                .Select(x => x.ProductId)
                .Distinct()
                .ToList();

            var products = await _context.Products
                .Where(x =>
                    x.IsActive &&
                    productIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.SKU,
                    x.CostPrice,
                    x.SellingPrice,
                    CategoryName = x.Category.Name
                }).ToListAsync();

            var productLookup = products.ToDictionary(
                x => x.Id);

            // 3. Build report in memory
            var items = inventories.Where(x => productLookup.ContainsKey(x.ProductId))
                .Select(x =>
                {
                    var product = productLookup[x.ProductId];

                    var stockStatus = x.QuantityInStock <= 0 ? "OutOfStock" : x.QuantityInStock <= x.ReorderLevel ? "LowStock" : "InStock";

                    return new InventoryReportItemResponse
                    {
                        ProductId = x.ProductId,

                        ProductName = product.Name,

                        SKU = product.SKU,

                        CategoryName = product.CategoryName,

                        CurrentStock = x.QuantityInStock,

                        ReorderLevel = x.ReorderLevel,

                        MinimumStock = x.MinimumStock,

                        MaximumStock = x.MaximumStock,

                        CostPrice = product.CostPrice,

                        SellingPrice = product.SellingPrice,

                        StockValue = x.QuantityInStock * product.CostPrice,

                        StockStatus = stockStatus
                    };
                }).ToList();

            return new InventoryReportResponse
            {
                TotalProducts = items.Count,

                InStockProducts = items.Count(x => x.StockStatus == "InStock"),

                LowStockProducts = items.Count(x => x.StockStatus == "LowStock"),

                OutOfStockProducts = items.Count(x => x.StockStatus == "OutOfStock"),

                TotalStockValue = items.Sum(x => x.StockValue),

                Products = items.OrderBy(x => x.StockStatus == "OutOfStock" ? 0 : 1).ThenBy(x => x.StockStatus == "LowStock" ? 0 : 1).ThenBy(x => x.ProductName).ToList()
            };
        }

        public async Task<List<LowStockProductResponse>> GetLowStockProductsAsync()
        {
            // 1. Get inventory directly
            var inventories = await _context.Inventories
                .Where(x =>
                    x.QuantityInStock <= x.ReorderLevel)
                .ToListAsync();

            // 2. Get required products separately
            var productIds = inventories
                .Select(x => x.ProductId)
                .Distinct()
                .ToList();

            var products = await _context.Products
                .Where(x =>
                    x.IsActive &&
                    productIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.SKU,
                    CategoryName = x.Category.Name
                })
                .ToListAsync();

            var productLookup = products.ToDictionary(
                x => x.Id);

            // 3. Build response in memory
            return inventories
                .Where(x =>
                    productLookup.ContainsKey(x.ProductId))
                .Select(x =>
                {
                    var product =
                        productLookup[x.ProductId];

                    return new LowStockProductResponse
                    {
                        ProductId = x.ProductId,

                        ProductName = product.Name,

                        SKU = product.SKU,

                        CategoryName = product.CategoryName,

                        CurrentStock = x.QuantityInStock,

                        ReorderLevel = x.ReorderLevel,

                        MinimumStock = x.MinimumStock,

                        MaximumStock = x.MaximumStock,

                        StockStatus =
                            x.QuantityInStock <= 0
                                ? "OutOfStock"
                                : "LowStock"
                    };
                })
                .OrderBy(x =>
                    x.StockStatus == "OutOfStock" ? 0 : 1)
                .ThenBy(x => x.CurrentStock)
                .ToList();
        }

        public async Task<CustomerReportResponse> GetCustomerReportAsync(DateTime from,DateTime to)
        {
            var fromBusiness = from.Date;

            var toBusinessExclusive =
                to.Date.AddDays(1);

            var fromUtc = _clock.ToUtc(fromBusiness);

            var toUtc = _clock.ToUtc(toBusinessExclusive);

            // --------------------------------
            // CUSTOMERS
            // --------------------------------

            var customers = await _context.Customers
                .Where(x => x.IsActive)
                .Select(x => new
                {
                    x.Id,

                    CustomerName =
                        (x.FirstName + " " + x.LastName).Trim()
                })
                .ToListAsync();

            // --------------------------------
            // SALES
            // --------------------------------

            var sales = await _context.Sales.Where(x =>
                    x.Status != Domain.Enums.SaleStatus.Cancelled &&
                    x.SaleDate >= fromUtc &&
                    x.SaleDate < toUtc &&
                    x.CustomerId != null)
                .GroupBy(x => x.CustomerId)
                .Select(g => new
                {
                    CustomerId = g.Key,

                    TotalOrders = g.Count(),

                    TotalPurchase = g.Sum(x => x.GrandTotal),

                    LastPurchaseDate = g.Max(x => x.SaleDate)
                }).ToListAsync();

            // --------------------------------
            // RETURNS
            // --------------------------------

            var returns = await _context.SaleReturns
                .Where(x => x.Status == Domain.Enums.ReturnStatus.Completed &&
                    x.ReturnDate >= fromUtc &&
                    x.ReturnDate < toUtc)
                .GroupBy(x => x.Sale.CustomerId)
                .Select(g => new
                {
                    CustomerId = g.Key,

                    TotalReturns =
                        g.Sum(x => x.TotalAmount)
                }).ToListAsync();

            // --------------------------------
            // LOOKUPS
            // --------------------------------

            var salesLookup = sales.ToDictionary(x => x.CustomerId);

            var returnsLookup = returns.ToDictionary(x => x.CustomerId);

            // --------------------------------
            // CUSTOMER REPORT
            // --------------------------------

            var items = customers
                .Where(x => salesLookup.ContainsKey(x.Id))
                .Select(customer =>
                {
                    var sale = salesLookup[customer.Id];

                    returnsLookup.TryGetValue(customer.Id,out var customerReturn);

                    var totalReturns = customerReturn?.TotalReturns ?? 0;

                    var netPurchase = Math.Max(0,sale.TotalPurchase - totalReturns);

                    var averageOrderValue = sale.TotalOrders == 0 ? 0 : netPurchase / sale.TotalOrders;

                    return new CustomerReportItemResponse
                    {
                        CustomerId = customer.Id,

                        CustomerName = customer.CustomerName,

                        TotalOrders = sale.TotalOrders,

                        TotalPurchase = sale.TotalPurchase,

                        TotalReturns = totalReturns,

                        NetPurchase = netPurchase,

                        AverageOrderValue = averageOrderValue,

                        LastPurchaseDate = _clock.ToBusinessTime(sale.LastPurchaseDate)
                    };
                })
                .OrderByDescending(x => x.NetPurchase)
                .ToList();

            // --------------------------------
            // SUMMARY
            // --------------------------------

            var totalSales = sales.Sum(x => x.TotalPurchase);

            var totalReturns = returns.Sum(x => x.TotalReturns);

            return new CustomerReportResponse
            {
                From = fromBusiness,

                To = to.Date,

                TotalCustomers = items.Count,

                TotalSales = totalSales,

                TotalReturns = totalReturns,

                NetSales = Math.Max(0,totalSales - totalReturns),

                Customers = items
            };
        }

    }
}
