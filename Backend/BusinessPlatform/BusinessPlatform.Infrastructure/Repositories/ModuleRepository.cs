using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace BusinessPlatform.Infrastructure.Repositories
{
    public class ModuleRepository : IModuleRepository
    {
        private readonly AppDbContext _context;

        public ModuleRepository(AppDbContext dbContext)
        {
            _context = dbContext;
        }

        public async Task<List<Module>> GetAllAsync()
        {
            return await _context.Modules
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<Module?> GetByIdAsync(Guid id)
        {
            return await _context.Modules
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Module?> GetByNameAsync(string name)
        {
            return await _context.Modules
                .FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task AddAsync(Module module)
        {
            await _context.Modules.AddAsync(module);
        }

        public void Update(Module module)
        {
            _context.Modules.Update(module);
        }

        public Task DeleteAsync(Module module)
        {
            _context.Modules.Remove(module);

            return Task.CompletedTask;
        }

        public async Task<bool> HasPermissionsAsync(Guid moduleId)
        {
            return await _context.Permissions
                .AnyAsync(x => x.ModuleId == moduleId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
