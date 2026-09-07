using BusinessPlatform.Application.DTOs.Product;
using BusinessPlatform.Application.Services.Product_Module;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoriesController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _categoryService.GetAllAsync());
        }

        // GET: api/categories/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            return Ok(await _categoryService.GetByIdAsync(id));
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryRequest request)
        {
            var category = await _categoryService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = category.Id },
                category);
        }

        // PUT: api/categories/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id,UpdateCategoryRequest request)
        {
            return Ok(await _categoryService.UpdateAsync(id, request));
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _categoryService.DeleteAsync(id);

            return NoContent();
        }

    }
}
