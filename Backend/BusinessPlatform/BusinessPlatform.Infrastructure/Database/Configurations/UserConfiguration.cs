using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(x => x.Id);


            builder.Property(x => x.UserName)
                .IsRequired()
                .HasMaxLength(100);


            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(150);


            builder.HasOne(x => x.Role)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.RoleId);


            builder.HasOne(x => x.Employee)
                .WithOne(x => x.User)
                .HasForeignKey<Employee>(x => x.UserId);
        }
    }
}
