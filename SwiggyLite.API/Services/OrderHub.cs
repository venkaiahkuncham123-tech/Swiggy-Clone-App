using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SwiggyLite.API.Services;

/// <summary>
/// SignalR hub that enables real-time communication between the server
/// and connected clients.  Clients join order-specific and user-specific
/// groups so that only interested parties receive status broadcasts.
/// </summary>
[Authorize]
public class OrderHub : Hub
{
    /// <summary>
    /// Adds the caller to the group associated with a specific order so they
    /// receive live status updates for that order only.
    /// </summary>
    public async Task JoinOrderGroup(int orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order_{orderId}");
    }

    /// <summary>
    /// Adds the caller to the group that receives *all* order updates for
    /// the given user (order list refresh).
    /// </summary>
    public async Task JoinUserOrderFeed(int userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}_orders");
    }

    /// <summary>
    /// Removes the caller from an order-specific group.
    /// </summary>
    public async Task LeaveOrderGroup(int orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order_{orderId}");
    }
}