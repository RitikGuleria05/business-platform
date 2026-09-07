namespace BusinessPlatform.Application.DTOs.Role
{
    public class AssignPermissionsRequest
    {
        public List<Guid> PermissionIds { get; set; } = new();
    }
}

