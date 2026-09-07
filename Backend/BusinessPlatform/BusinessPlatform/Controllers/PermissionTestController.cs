using BusinessPlatform.API.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionTestController : ControllerBase
    {
        [Authorize]
        [Permission("product.write")]
        [HttpPost("product-write")]
        public IActionResult ProductWrite()
        {

            return Ok(new
            {
                message = "You have product.write permission"
            });

        }

        [Authorize]
        [Permission("product.delete")]
        [HttpDelete("product-delete")]
        public IActionResult ProductDelete()
        {

            return Ok(new
            {
                message = "You have product.delete permission"
            });

        }

    }
}
