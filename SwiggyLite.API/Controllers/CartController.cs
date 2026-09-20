using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SwiggyLite.API.Data;
using SwiggyLite.API.Models;
using SwiggyLite.API.Services;

namespace SwiggyLite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController(ICartService cartService) : ControllerBase
{
    private readonly ICartService _cartService = cartService;

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return int.TryParse(claim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var cart = await _cartService.GetCartAsync(userId);
        var total = await _cartService.GetCartTotalAsync(userId);

        return Ok(new { items = cart, totalAmount = total });
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        if (request.Quantity < 1)
            return BadRequest(new { message = "Quantity must be at least 1" });

        var cartItem = await _cartService.AddToCartAsync(userId, request.MenuItemId, request.Quantity);
        if (cartItem == null)
            return NotFound(new { message = "Menu item not found or not available" });

        return Ok(new { message = "Item added to cart", item = cartItem });
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartRequest request)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var cartItem = await _cartService.UpdateCartItemAsync(userId, request.MenuItemId, request.Quantity);
        if (cartItem == null)
            return NotFound();

        return Ok(new { item = cartItem, totalAmount = await _cartService.GetCartTotalAsync(userId) });
    }

    [HttpDelete("remove/{menuItemId}")]
    public async Task<IActionResult> RemoveFromCart(int menuItemId)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var result = await _cartService.RemoveFromCartAsync(userId, menuItemId);
        if (!result)
            return NotFound();

        return Ok(new { message = "Item removed from cart" });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        await _cartService.ClearCartAsync(userId);
        return Ok(new { message = "Cart cleared" });
    }
}

public class AddToCartRequest
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartRequest
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
}
