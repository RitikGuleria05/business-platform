namespace BusinessPlatform.Application.DTOs.Reports
{
    public class SalesTrendResponse
    {
        public DateTime Date { get; set; }

        public int Orders { get; set; }

        public decimal Revenue { get; set; }
    }
}
