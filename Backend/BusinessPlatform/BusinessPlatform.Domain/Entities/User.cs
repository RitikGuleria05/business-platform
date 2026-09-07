using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;


        public bool IsActive { get; set; } = true;


        // Foreign Key
        public Guid RoleId { get; set; }


        // Navigation Property
        public Role Role { get; set; } = null!;


        // One user has one employee profile
        public Employee? Employee { get; set; }


        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
