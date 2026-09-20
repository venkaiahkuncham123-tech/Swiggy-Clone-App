using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SwiggyLite.API.Data;

namespace SwiggyLite.API.Services;

/// <summary>
/// Background service that simulates the restaurant order pipeline in real
/// time.  Every <see cref="CheckInterval"/> it advances the status of
/// non-terminal orders (Pending -> Confirmed -> Preparing ->
/// OutForDelivery -> Delivered) and pushes the new status to every
/// connected client via SignalR.
/// </summary>
public class OrderStatusSimulator(IServiceProvider serviceProvider, IHubContext<OrderHub> hubContext) : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromSeconds(8);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var activeOrders = await db.Orders
                    .Where(o => o.Status != "Delivered" && o.Status != "Cancelled")
                    .ToListAsync(stoppingToken);

                foreach (var order in activeOrders)
                {
                    var next = GetNextStatus(order.Status);
                    if (next == null || next == order.Status) continue;

                    order.Status = next;
                    order.UpdatedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(stoppingToken);

                    // Broadcast to the order-specific group
                    await hubContext.Clients
                        .Group($"order_{order.Id}")
                        .SendAsync("OrderStatusUpdated", order.Id, next, stoppingToken);

                    // Broadcast to the user's order feed (order list refresh)
                    await hubContext.Clients
                        .Group($"user_{order.UserId}_orders")
                        .SendAsync("OrderStatusUpdated", order.Id, next, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                // Log and continue so the simulator never dies
                Console.WriteLine($"OrderStatusSimulator error: {ex.Message}");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    /// <summary>
    /// Returns the next status in the pipeline, or <c>null</c> if the order
    /// is already in a terminal state.
    /// </summary>
    private static string? GetNextStatus(string currentStatus) =>
        currentStatus switch
        {
            "Pending"       => "Confirmed",
            "Confirmed"     => "Preparing",
            "Preparing"     => "OutForDelivery",
            "OutForDelivery" => "Delivered",
            "Delivered"     => null,
            "Cancelled"     => null,
            _               => "Pending"
        };
}