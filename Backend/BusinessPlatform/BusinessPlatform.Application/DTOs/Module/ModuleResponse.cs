namespace BusinessPlatform.Application.DTOs.Module
{
    public class ModuleResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}
