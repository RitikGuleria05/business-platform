using BusinessPlatform.Application.DTOs.Role;
using BusinessPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoleController : ControllerBase
    {
        private readonly RoleService _roleService;

        public RoleController(RoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _roleService.GetAllAsync();

            return Ok(roles);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateRoleRequest request)
        {
            var role = await _roleService.CreateAsync(request);

            return CreatedAtAction(nameof(GetAll),new { id = role.Id },role);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var role = await _roleService.GetByIdAsync(id);

            return Ok(role);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id,UpdateRoleRequest request)
        {
            var role = await _roleService.UpdateAsync(id, request);

            return Ok(role);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _roleService.DeleteAsync(id);

            return NoContent();
        }

        // GET: api/roles/{id}/permissions
        [HttpGet("{id:guid}/permissions")]
        public async Task<IActionResult> GetPermissions(Guid id)
        {
            var permissions =  await _roleService.GetPermissionsAsync(id);

            return Ok(permissions);
        }

        // POST: api/roles/{id}/permissions
        [HttpPost("{id:guid}/permissions")]
        public async Task<IActionResult> AssignPermissions(Guid id,AssignPermissionsRequest request)
        {
            await _roleService.AssignPermissionsAsync(id, request);

            return Ok(new
            {
                Message = "Permissions assigned successfully."
            });
        }
    }
}
