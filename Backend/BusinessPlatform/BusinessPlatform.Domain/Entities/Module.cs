using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Domain.Entities
{
    public class Module
    {
        public Guid Id { get; set; }


        public string Name { get; set; } = string.Empty;


        public string? Description { get; set; }



        public ICollection<Permission> Permissions { get; set; }  = new List<Permission>();
    }
}
