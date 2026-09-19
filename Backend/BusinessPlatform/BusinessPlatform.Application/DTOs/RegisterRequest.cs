namespace BusinessPlatform.Application.DTOs
{
    public class RegisterRequest
    {
        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        //public string RoleId { get; set; } = "ea2a66d0-1589-43c8-8d3c-c7e9a96de47e";
    }
}
