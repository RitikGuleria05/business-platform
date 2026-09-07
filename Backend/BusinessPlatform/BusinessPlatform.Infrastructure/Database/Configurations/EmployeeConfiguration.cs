using BusinessPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Database.Configurations
{
    public class EmployeeConfiguration
     : IEntityTypeConfiguration<Employee>
    {

        public void Configure(EntityTypeBuilder<Employee> builder)
        {

            builder.ToTable("Employees");


            builder.HasKey(x => x.Id);



            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(20);



            builder.Property(x => x.Address)
                .HasMaxLength(300);



            builder.HasOne(x => x.User)
                .WithOne(x => x.Employee)
                .HasForeignKey<Employee>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
