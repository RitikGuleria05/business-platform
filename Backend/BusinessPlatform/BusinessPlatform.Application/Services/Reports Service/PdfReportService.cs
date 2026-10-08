using BusinessPlatform.Application.Interfaces.Reports;
using QuestPDF.Fluent;
using QuestPDF.Helpers;

namespace BusinessPlatform.Application.Services.Reports_Service
{
    public class PdfReportService : IPdfReportService
    {
        private readonly ReportService _reportService;

        public PdfReportService(ReportService reportService)
        {
            _reportService = reportService;
        }

        public async Task<byte[]> GenerateSalesReportAsync(DateTime from,DateTime to)
        {
            var report = await _reportService.GetSalesReportAsync(from,to);

            var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(30);

                        page.Header()
                            .Text("Sales Report")
                            .Bold()
                            .FontSize(20);

                        page.Content()
                            .PaddingVertical(20)
                            .Column(column =>
                            {
                                column.Spacing(10);

                                // Date range
                                column.Item().Text($"From: {from:dd-MM-yyyy}" + $"To: {to:dd-MM-yyyy}");

                                // Summary
                                column.Item()
                                    .Text("Summary")
                                    .Bold()
                                    .FontSize(14);

                                column.Item().Text($"Gross Sales: {report.GrossSales:N2}");

                                column.Item().Text($"Total Returns: {report.TotalReturns:N2}");

                                column.Item().Text($"Net Sales: {report.NetSales:N2}");

                                column.Item().Text($"Total Orders: {report.TotalOrders}");

                                column.Item().Text($"Average Order Value: " +$"{report.AverageOrderValue:N2}");

                                // Sales table
                                column.Item()
                                    .PaddingTop(15)
                                    .Text("Sales")
                                    .Bold()
                                    .FontSize(14);

                                column.Item()
                                    .Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(1.5f);
                                            columns.RelativeColumn(1);
                                            columns.RelativeColumn(2);
                                            columns.RelativeColumn(1);
                                            columns.RelativeColumn(1);
                                        });

                                        table.Header(header =>
                                        {
                                            header.Cell()
                                                .Text("Invoice")
                                                .Bold();

                                            header.Cell()
                                                .Text("Date")
                                                .Bold();

                                            header.Cell()
                                                .Text("Customer")
                                                .Bold();

                                            header.Cell()
                                                .Text("Total")
                                                .Bold();

                                            header.Cell()
                                                .Text("Payment")
                                                .Bold();
                                        });

                                        foreach (var sale in report.Sales)
                                        {
                                            table.Cell().Text(sale.InvoiceNumber);

                                            table.Cell().Text(sale.SaleDate.ToString("dd-MM-yyyy"));

                                            table.Cell().Text(sale.CustomerName);

                                            table.Cell().Text(sale.GrandTotal.ToString("N2"));

                                            table.Cell().Text(sale.PaymentStatus);
                                        }
                                    });
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text(text =>
                            {
                                text.Span("Page ");
                                text.CurrentPageNumber();
                            });
                    });
                });

            return document.GeneratePdf();
        }

        public Task<byte[]> GenerateProductReportAsync(DateTime from,DateTime to)
        {
            throw new NotImplementedException();
        }

        public Task<byte[]> GenerateInventoryReportAsync()
        {
            throw new NotImplementedException();
        }

        public Task<byte[]> GenerateCustomerReportAsync(DateTime from,DateTime to)
        {
            throw new NotImplementedException();
        }
    }
}
