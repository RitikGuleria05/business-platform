using BusinessPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Application.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshToken token);

        Task<RefreshToken?> GetByTokenAsync(string token);

        Task RevokeAsync(RefreshToken token);

        Task RevokeAllForUserAsync(Guid userId);

        Task SaveAsync();

    }
}
