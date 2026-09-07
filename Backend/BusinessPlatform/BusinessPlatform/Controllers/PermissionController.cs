using BusinessPlatform.Application.DTOs.Permission;
using BusinessPlatform.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly PermissionService _permissionService;

        public PermissionController(PermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _permissionService.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
            => Ok(await _permissionService.GetByIdAsync(id));

        [HttpPost]
        public async Task<IActionResult> Create(CreatePermissionRequest request)
        {
            var permission = await _permissionService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = permission.Id },
                permission);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(
            Guid id,
            UpdatePermissionRequest request)
        {
            return Ok(await _permissionService.UpdateAsync(id, request));
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _permissionService.DeleteAsync(id);

            return NoContent();
        }

    }
}
