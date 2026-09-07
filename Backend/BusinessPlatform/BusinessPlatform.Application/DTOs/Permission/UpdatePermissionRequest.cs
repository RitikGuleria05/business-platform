using System.ComponentModel.DataAnnotations;

namespace BusinessPlatform.Application.DTOs.Permission
{
    public class UpdatePermissionRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid ModuleId { get; set; }
    }
}
