using System.ComponentModel.DataAnnotations;

namespace BusinessPlatform.Application.DTOs.Role
{
    public class UpdateRoleRequest
    {

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
    }
}
