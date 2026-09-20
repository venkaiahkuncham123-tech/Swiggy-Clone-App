using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SwiggyLite.API.Services;

namespace SwiggyLite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController(IOrderService orderService, IHubContext<OrderHub> hubContext) : ControllerBase
{
    private readonly IOrderService _orderService = orderService;
    private readonly IHubContext<OrderHub> _hubContext = hubContext;

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return int.TryParse(claim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserOrders()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var orders = await _orderService.GetUserOrdersAsync(userId);
        return Ok(orders);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderById(int orderId)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var order = await _orderService.GetOrderByIdAsync(orderId);
        if (order == null)
            return NotFound();

        if (order.UserId != userId)
            return Forbid();

        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
            return BadRequest(new { message = "Delivery address is required" });

        if (request.Items == null || !request.Items.Any())
            return BadRequest(new { message = "Order must have at least one item" });

        try
        {
            var order = await _orderService.CreateOrderAsync(
                userId,
                request.RestaurantId,
                request.DeliveryAddress,
                request.Instructions,
                request.Items.Select(i => (i.MenuItemId, i.Quantity)));

            // Notify real-time listeners that a new order was placed
            await _hubContext.Clients
                .Group($"user_{userId}_orders")
                .SendAsync("OrderCreated", order.Id, order.Status);

            await _hubContext.Clients
                .Group($"order_{order.Id}")
                .SendAsync("OrderCreated", order.Id, order.Status);

            return Created($"/api/orders/{order.Id}", new { message = "Order placed successfully", order });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{orderId}/status")]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] UpdateStatusRequest request)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var order = await _orderService.GetOrderByIdAsync(orderId);
        if (order == null)
            return NotFound();

        if (order.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        var validStatuses = new[] { "Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(request.NewStatus))
            return BadRequest(new { message = "Invalid status" });

        var result = await _orderService.UpdateOrderStatusAsync(orderId, request.NewStatus);
        if (!result)
            return NotFound();

        // Broadcast the status change to all real-time listeners
        await _hubContext.Clients
            .Group($"order_{orderId}")
            .SendAsync("OrderStatusUpdated", orderId, request.NewStatus);

        await _hubContext.Clients
            .Group($"user_{order.UserId}_orders")
            .SendAsync("OrderStatusUpdated", orderId, request.NewStatus);

        return Ok(new { message = $"Order status updated to {request.NewStatus}" });
    }

    [HttpDelete("{orderId}/cancel")]
    public async Task<IActionResult> CancelOrder(int orderId)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var order = await _orderService.GetOrderByIdAsync(orderId);
        if (order == null)
            return NotFound();

        if (order.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        // Only allow cancellation for non-terminal states
        var cancellable = new[] { "Pending", "Confirmed" };
        if (!cancellable.Contains(order.Status))
            return BadRequest(new { message = $"Order cannot be cancelled in {order.Status} status" });

        var result = await _orderService.UpdateOrderStatusAsync(orderId, "Cancelled");
        if (!result)
            return NotFound();

        await _hubContext.Clients
            .Group($"order_{orderId}")
            .SendAsync("OrderStatusUpdated", orderId, "Cancelled");

        await _hubContext.Clients
            .Group($"user_{userId}_orders")
            .SendAsync("OrderStatusUpdated", orderId, "Cancelled");

        return Ok(new { message = "Order cancelled successfully" });
    }
}

public class CreateOrderRequest
{
    public int RestaurantId { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public List<OrderItemRequest> Items { get; set; } = new();
}

public class OrderItemRequest
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateStatusRequest
{
    public string NewStatus { get; set; } = string.Empty;
}
