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
    public class RefreshTokenRepository : IRefreshTokenRepository
    {

        private readonly AppDbContext _context;

        public RefreshTokenRepository(
            AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RefreshToken token)
        {
            await _context.RefreshTokens.AddAsync(token);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(x => x.User)
                .ThenInclude(x => x.Role)
                .FirstOrDefaultAsync(x => x.Token == token);
        }

    }
}
