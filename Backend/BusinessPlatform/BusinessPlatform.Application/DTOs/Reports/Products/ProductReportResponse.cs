namespace BusinessPlatform.Application.DTOs.Reports.Products
{
    public class ProductReportResponse
    {
        public DateTime From { get; set; }

        public DateTime To { get; set; }

        public List<ProductReportItemResponse> Products { get; set; } = [];
    }
}
