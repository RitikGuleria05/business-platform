namespace BusinessPlatform.Domain.Entities
{
    public class Employee
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        
        public User User { get; set; } = null!;

        public string PhoneNumber { get; set; }
            = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        public bool IsMarried { get; set; }


        public string? Address { get; set; }

        public DateTime JoiningDate { get; set; } = DateTime.UtcNow;
    }
}
