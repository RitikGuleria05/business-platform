using BusinessPlatform.Application.Interfaces.Reports;
using ClosedXML.Excel;

namespace BusinessPlatform.Application.Services.Reports_Service
{
    public class ExcelReportService : IExcelReportService
    {
        private readonly ReportService _reportService;

        public ExcelReportService(ReportService reportService)
        {
            _reportService = reportService;
        }

        public async Task<byte[]> GenerateSalesReportAsync(DateTime from,DateTime to)
        {
            var report = await _reportService.GetSalesReportAsync(from,to);

            using var workbook = new XLWorkbook();

            var worksheet = workbook.Worksheets.Add("Sales Report");

            // -------------------------
            // Title
            // -------------------------

            worksheet.Cell("A1").Value = "Sales Report";

            worksheet.Cell("A2").Value = $"From: {from:dd-MM-yyyy}";

            worksheet.Cell("B2").Value = $"To: {to:dd-MM-yyyy}";

            // -------------------------
            // Summary
            // -------------------------

            worksheet.Cell("A4").Value = "Gross Sales";

            worksheet.Cell("B4").Value = report.GrossSales;

            worksheet.Cell("C4").Value = "Total Returns";

            worksheet.Cell("D4").Value = report.TotalReturns;

            worksheet.Cell("E4").Value = "Net Sales";

            worksheet.Cell("F4").Value = report.NetSales;

            worksheet.Cell("G4").Value = "Total Orders";

            worksheet.Cell("H4").Value = report.TotalOrders;

            // -------------------------
            // Table Header
            // -------------------------

            var headerRow = 6;

            worksheet.Cell(headerRow, 1).Value = "Invoice Number";
            worksheet.Cell(headerRow, 2).Value = "Date";
            worksheet.Cell(headerRow, 3).Value = "Customer";
            worksheet.Cell(headerRow, 4).Value = "Sub Total";
            worksheet.Cell(headerRow, 5).Value = "Discount";
            worksheet.Cell(headerRow, 6).Value = "Tax";
            worksheet.Cell(headerRow, 7).Value = "Grand Total";
            worksheet.Cell(headerRow, 8).Value = "Payment Status";

            // -------------------------
            // Data
            // -------------------------

            var row = headerRow + 1;

            foreach (var sale in report.Sales)
            {
                worksheet.Cell(row, 1).Value = sale.InvoiceNumber;

                worksheet.Cell(row, 2).Value = sale.SaleDate;

                worksheet.Cell(row, 3).Value = sale.CustomerName;

                worksheet.Cell(row, 4).Value = sale.SubTotal;

                worksheet.Cell(row, 5).Value = sale.Discount;

                worksheet.Cell(row, 6).Value = sale.Tax;

                worksheet.Cell(row, 7).Value = sale.GrandTotal;

                worksheet.Cell(row, 8).Value = sale.PaymentStatus;

                row++;
            }

            // -------------------------
            // Formatting
            // -------------------------

            var headerRange = worksheet.Range(headerRow,1,headerRow,8);

            headerRange.Style.Font.Bold = true;

            worksheet.Columns().AdjustToContents();

            // -------------------------
            // Return Excel file
            // -------------------------

            using var stream =  new MemoryStream();

            workbook.SaveAs(stream);

            return stream.ToArray();
        }

        public async Task<byte[]> GenerateProductReportAsync(DateTime from,DateTime to)
        {
            var report = await _reportService.GetProductReportAsync(from,to);

            using var workbook = new XLWorkbook();

            var worksheet = workbook.Worksheets.Add("Product Report");

            // -------------------------
            // Title
            // -------------------------

            worksheet.Cell("A1").Value = "Product Report";

            worksheet.Cell("A2").Value = $"From: {from:dd-MM-yyyy}";

            worksheet.Cell("B2").Value = $"To: {to:dd-MM-yyyy}";

            // -------------------------
            // Table Header
            // -------------------------

            var headerRow = 4;

            worksheet.Cell(headerRow, 1).Value = "Product";
            worksheet.Cell(headerRow, 2).Value = "SKU";
            worksheet.Cell(headerRow, 3).Value = "Category";
            worksheet.Cell(headerRow, 4).Value = "Current Stock";
            worksheet.Cell(headerRow, 5).Value = "Quantity Sold";
            worksheet.Cell(headerRow, 6).Value = "Gross Revenue";
            worksheet.Cell(headerRow, 7).Value = "Quantity Returned";
            worksheet.Cell(headerRow, 8).Value = "Return Amount";
            worksheet.Cell(headerRow, 9).Value = "Net Quantity Sold";
            worksheet.Cell(headerRow, 10).Value = "Net Revenue";

            // -------------------------
            // Data
            // -------------------------

            var row = headerRow + 1;

            foreach (var product in report.Products)
            {
                worksheet.Cell(row, 1).Value = product.ProductName;

                worksheet.Cell(row, 2).Value = product.SKU;

                worksheet.Cell(row, 3).Value = product.CategoryName;

                worksheet.Cell(row, 4).Value = product.CurrentStock;

                worksheet.Cell(row, 5).Value = product.QuantitySold;

                worksheet.Cell(row, 6).Value = product.GrossRevenue;

                worksheet.Cell(row, 7).Value = product.QuantityReturned;

                worksheet.Cell(row, 8).Value = product.ReturnAmount;

                worksheet.Cell(row, 9).Value = product.NetQuantitySold;

                worksheet.Cell(row, 10).Value = product.NetRevenue;

                row++;
            }

            // -------------------------
            // Formatting
            // -------------------------

            var headerRange = worksheet.Range(headerRow,1,headerRow,10);

            headerRange.Style.Font.Bold = true;

            worksheet.Columns().AdjustToContents();

            // -------------------------
            // Return Excel file
            // -------------------------

            using var stream = new MemoryStream();

            workbook.SaveAs(stream);

            return stream.ToArray();
        }

        public async Task<byte[]> GenerateInventoryReportAsync()
        {
            var report = await _reportService.GetInventoryReportAsync();

            using var workbook = new XLWorkbook();

            var worksheet = workbook.Worksheets.Add("Inventory Report");

            // -------------------------
            // Title
            // -------------------------

            worksheet.Cell("A1").Value = "Inventory Report";

            // -------------------------
            // Summary
            // -------------------------

            worksheet.Cell("A3").Value = "Total Products";
            worksheet.Cell("B3").Value = report.TotalProducts;

            worksheet.Cell("C3").Value = "In Stock";
            worksheet.Cell("D3").Value = report.InStockProducts;

            worksheet.Cell("E3").Value = "Low Stock";
            worksheet.Cell("F3").Value = report.LowStockProducts;

            worksheet.Cell("G3").Value = "Out Of Stock";
            worksheet.Cell("H3").Value = report.OutOfStockProducts;

            worksheet.Cell("I3").Value = "Total Stock Value";
            worksheet.Cell("J3").Value = report.TotalStockValue;

            // -------------------------
            // Table Header
            // -------------------------

            var headerRow = 5;

            worksheet.Cell(headerRow, 1).Value = "Product";
            worksheet.Cell(headerRow, 2).Value = "SKU";
            worksheet.Cell(headerRow, 3).Value = "Category";
            worksheet.Cell(headerRow, 4).Value = "Current Stock";
            worksheet.Cell(headerRow, 5).Value = "Reorder Level";
            worksheet.Cell(headerRow, 6).Value = "Minimum Stock";
            worksheet.Cell(headerRow, 7).Value = "Maximum Stock";
            worksheet.Cell(headerRow, 8).Value = "Cost Price";
            worksheet.Cell(headerRow, 9).Value = "Selling Price";
            worksheet.Cell(headerRow, 10).Value = "Stock Value";
            worksheet.Cell(headerRow, 11).Value = "Stock Status";

            // -------------------------
            // Data
            // -------------------------

            var row = headerRow + 1;

            foreach (var product in report.Products)
            {
                worksheet.Cell(row, 1).Value = product.ProductName;

                worksheet.Cell(row, 2).Value = product.SKU;

                worksheet.Cell(row, 3).Value = product.CategoryName;

                worksheet.Cell(row, 4).Value = product.CurrentStock;

                worksheet.Cell(row, 5).Value = product.ReorderLevel;

                worksheet.Cell(row, 6).Value = product.MinimumStock;

                worksheet.Cell(row, 7).Value = product.MaximumStock;

                worksheet.Cell(row, 8).Value = product.CostPrice;

                worksheet.Cell(row, 9).Value = product.SellingPrice;

                worksheet.Cell(row, 10).Value = product.StockValue;

                worksheet.Cell(row, 11).Value = product.StockStatus;

                row++;
            }

            // -------------------------
            // Formatting
            // -------------------------

            var headerRange = worksheet.Range(headerRow,1,headerRow,11);

            headerRange.Style.Font.Bold = true;

            worksheet.Columns().AdjustToContents();

            // -------------------------
            // Return Excel
            // -------------------------

            using var stream = new MemoryStream();

            workbook.SaveAs(stream);

            return stream.ToArray();
        }

        public async Task<byte[]> GenerateCustomerReportAsync(DateTime from, DateTime to)
        {
            var report = await _reportService.GetCustomerReportAsync(from,to);

            using var workbook = new XLWorkbook();

            var worksheet = workbook.Worksheets.Add("Customer Report");

            // -------------------------
            // Title
            // -------------------------

            worksheet.Cell("A1").Value = "Customer Report";

            worksheet.Cell("A2").Value = $"From: {from:dd-MM-yyyy}";

            worksheet.Cell("B2").Value = $"To: {to:dd-MM-yyyy}";

            // -------------------------
            // Summary
            // -------------------------

            worksheet.Cell("A4").Value = "Total Customers";

            worksheet.Cell("B4").Value = report.TotalCustomers;

            worksheet.Cell("C4").Value = "Total Sales";

            worksheet.Cell("D4").Value = report.TotalSales;

            worksheet.Cell("E4").Value = "Total Returns";

            worksheet.Cell("F4").Value = report.TotalReturns;

            worksheet.Cell("G4").Value = "Net Sales";

            worksheet.Cell("H4").Value = report.NetSales;

            // -------------------------
            // Table Header
            // -------------------------

            var headerRow = 6;

            worksheet.Cell(headerRow, 1).Value = "Customer";
            worksheet.Cell(headerRow, 2).Value = "Total Orders";
            worksheet.Cell(headerRow, 3).Value = "Total Purchase";
            worksheet.Cell(headerRow, 4).Value = "Total Returns";
            worksheet.Cell(headerRow, 5).Value = "Net Purchase";
            worksheet.Cell(headerRow, 6).Value = "Average Order Value";
            worksheet.Cell(headerRow, 7).Value = "Last Purchase Date";

            // -------------------------
            // Data
            // -------------------------

            var row = headerRow + 1;

            foreach (var customer in report.Customers)
            {
                worksheet.Cell(row, 1).Value = customer.CustomerName;

                worksheet.Cell(row, 2).Value = customer.TotalOrders;

                worksheet.Cell(row, 3).Value = customer.TotalPurchase;

                worksheet.Cell(row, 4).Value = customer.TotalReturns;

                worksheet.Cell(row, 5).Value = customer.NetPurchase;

                worksheet.Cell(row, 6).Value = customer.AverageOrderValue;

                if (customer.LastPurchaseDate.HasValue)
                {
                    worksheet.Cell(row, 7).Value = customer.LastPurchaseDate.Value;
                }

                row++;
            }

            // -------------------------
            // Formatting
            // -------------------------

            var headerRange = worksheet.Range(headerRow,1,headerRow,7);

            headerRange.Style.Font.Bold = true;

            worksheet.Columns().AdjustToContents();

            // -------------------------
            // Return Excel
            // -------------------------

            using var stream = new MemoryStream();

            workbook.SaveAs(stream);

            return stream.ToArray();
        }
    }
}