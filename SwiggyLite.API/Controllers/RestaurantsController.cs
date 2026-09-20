using Microsoft.AspNetCore.Mvc;
using SwiggyLite.API.Services;

namespace SwiggyLite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController(IRestaurantService restaurantService) : ControllerBase
{
    private readonly IRestaurantService _restaurantService = restaurantService;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? query,
        [FromQuery] string? cuisine,
        [FromQuery] string? area,
        [FromQuery] int? minRating)
    {
        var restaurants = await _restaurantService.SearchAsync(query, cuisine, area, minRating);
        return Ok(restaurants);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var restaurant = await _restaurantService.GetByIdAsync(id);
        if (restaurant == null)
            return NotFound();

        return Ok(restaurant);
    }
}
