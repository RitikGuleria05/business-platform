using System.ComponentModel.DataAnnotations;

namespace BusinessPlatform.Application.DTOs.Module
{
    public class CreateModuleRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }
    }
}
