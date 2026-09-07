using BusinessPlatform.Application.DTOs.Module;
using BusinessPlatform.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModuleController : ControllerBase
    {
        private readonly ModuleService _moduleService;

        public ModuleController(ModuleService moduleService)
        {
            _moduleService = moduleService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _moduleService.GetAllAsync());


        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)  => Ok(await _moduleService.GetByIdAsync(id));


        [HttpPost]
        public async Task<IActionResult> Create(CreateModuleRequest request)
        {
            var module = await _moduleService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = module.Id },
                module);
        }


        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id,UpdateModuleRequest request)
        {
            return Ok(await _moduleService.UpdateAsync(id, request));
        }


        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _moduleService.DeleteAsync(id);

            return NoContent();
        }
    }
}
