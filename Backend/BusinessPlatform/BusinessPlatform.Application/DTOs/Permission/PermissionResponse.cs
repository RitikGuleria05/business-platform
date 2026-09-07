namespace BusinessPlatform.Application.DTOs.Permission
{
    public class PermissionResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public Guid ModuleId { get; set; }

        public string ModuleName { get; set; } = string.Empty;
    }
}
