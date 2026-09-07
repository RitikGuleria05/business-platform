using BusinessPlatform.Application.DTOs.Product;
using BusinessPlatform.Application.Interfaces.Product_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Exceptions;

namespace BusinessPlatform.Application.Services.Product_Module
{
    public class CategoryService
    {

        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        // GET: All Categories
        public async Task<List<CategoryResponse>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();

            return categories.Select(category => new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            }).ToList();
        }

        // GET: Category By Id
        public async Task<CategoryResponse> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null)
            {
                throw new NotFoundException("Category not found.");
            }

            return new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            };
        }

        // POST: Create Category
        public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
        {
            var existingCategory =
                await _categoryRepository.GetByNameAsync(request.Name);

            if (existingCategory != null)
            {
                throw new BadRequestException("Category already exists.");
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _categoryRepository.AddAsync(category);

            await _categoryRepository.SaveChangesAsync();

            return new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            };
        }

        // PUT: Update Category
        public async Task<CategoryResponse> UpdateAsync(
            Guid id,
            UpdateCategoryRequest request)
        {
            var category =
                await _categoryRepository.GetByIdAsync(id);

            if (category == null)
            {
                throw new NotFoundException("Category not found.");
            }

            var existingCategory =
                await _categoryRepository.GetByNameAsync(request.Name);

            if (existingCategory != null && existingCategory.Id != id)
            {
                throw new BadRequestException("Category name already exists.");
            }

            category.Name = request.Name.Trim();
            category.Description = request.Description;
            category.IsActive = request.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            _categoryRepository.Update(category);

            await _categoryRepository.SaveChangesAsync();

            return new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            };
        }

        // DELETE: Category
        public async Task DeleteAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null)
            {
                throw new NotFoundException("Category not found.");
            }

            var hasProducts =
                await _categoryRepository.HasProductsAsync(id);

            if (hasProducts)
            {
                throw new BadRequestException("Cannot delete category because products are assigned to it.");
            }

            await _categoryRepository.DeleteAsync(category);

            await _categoryRepository.SaveChangesAsync();
        }
    }
}
