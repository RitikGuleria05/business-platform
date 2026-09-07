namespace BusinessPlatform.Domain.Entities
{
    public class Permission
    {
        public Guid Id { get; set; }


        public string Name { get; set; } = string.Empty;


        // Foreign Key
        public Guid ModuleId { get; set; }


        // Navigation Property
        public Module Module { get; set; } = null!;


        // Many-to-many relationship
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
