using Microsoft.AspNetCore.Mvc;
using SwiggyLite.API.Services;

namespace SwiggyLite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenusController(IMenuService menuService) : ControllerBase
{
    private readonly IMenuService _menuService = menuService;

    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetMenuByRestaurant(int restaurantId)
    {
        var menuItems = await _menuService.GetMenuByRestaurantAsync(restaurantId);
        return Ok(menuItems);
    }

    [HttpGet("item/{menuItemId}")]
    public async Task<IActionResult> GetMenuItem(int menuItemId)
    {
        var menuItem = await _menuService.GetMenuItemAsync(menuItemId);
        if (menuItem == null)
            return NotFound();

        return Ok(menuItem);
    }
}
