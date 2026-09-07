using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {

        private readonly AppDbContext _context;


        public UserRepository(AppDbContext context)
        {
            _context = context;
        }



        public async Task<User?> GetByEmailAsync(string email)
        {

            return await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.Email == email);

        }

        public async Task<User?> GetByIdAsync(Guid id)
        {

            return await _context.Users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        }

        public async Task AddAsync(User user)
        {

            await _context.Users.AddAsync(user);

        }

        //public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        //{
        //    return await _context.RefreshTokens
        //        .Include(x => x.User)
        //        .FirstOrDefaultAsync(
        //            x => x.Token == token
        //        );

        //}

        public async Task SaveChangesAsync()
        {

            await _context.SaveChangesAsync();

        }

    }
}
