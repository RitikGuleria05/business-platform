using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using BusinessPlatform.Domain.Entities;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class ModuleConfiguration : IEntityTypeConfiguration<Module>
    {
        public void Configure(EntityTypeBuilder<Module> builder)
        {

            builder.ToTable("Modules");


            builder.HasKey(x => x.Id);


            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);


            builder.Property(x => x.Description)
                .HasMaxLength(250);

        }
    }
}
