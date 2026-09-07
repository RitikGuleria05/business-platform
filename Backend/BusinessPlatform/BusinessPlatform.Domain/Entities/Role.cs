namespace BusinessPlatform.Domain.Entities
{
    public class Role
    {
        public Guid Id { get; set; }


        public string Name { get; set; } = string.Empty;


        public string? Description { get; set; }



        // Users with this role

        public ICollection<User> Users { get; set; } = new List<User>();


        // Role permissions

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    }
}
