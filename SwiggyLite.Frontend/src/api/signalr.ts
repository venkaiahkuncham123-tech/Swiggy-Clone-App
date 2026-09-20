import * as signalR from '@microsoft/signalr';

interface StatusUpdateHandler {
  (orderId: number, newStatus: string): void;
}

interface OrderCreatedHandler {
  (orderId: number, status: string): void;
}

let connection: signalR.HubConnection | null = null;

const getBaseUrl = (): string => {
  return window.location.origin;
};

const getToken = (): string | null => localStorage.getItem('token');

// Starts (or restarts) a SignalR connection to the OrderHub.
// onStatusUpdate – callback(orderId, newStatus)
// onOrderCreated  – callback(orderId, status)
export const startSignalRConnection = async (
  onStatusUpdate?: StatusUpdateHandler,
  onOrderCreated?: OrderCreatedHandler
): Promise<signalR.HubConnection | null> => {
  const token = getToken();
  if (!token) return null;

  stopSignalRConnection();

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${getBaseUrl()}/hubs/orders`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: retryContext =>
        Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000)
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  if (onStatusUpdate) {
    connection.on('OrderStatusUpdated', onStatusUpdate);
  }

  if (onOrderCreated) {
    connection.on('OrderCreated', onOrderCreated);
  }

  try {
    await connection.start();
    console.log('SignalR connected:', connection.connectionId);
    return connection;
  } catch (err) {
    console.error('SignalR connection error:', err);
    return null;
  }
};

export const joinOrderGroup = async (orderId: number): Promise<void> => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    await connection.invoke('JoinOrderGroup', orderId);
  }
};

export const joinUserOrderFeed = async (userId: number): Promise<void> => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    await connection.invoke('JoinUserOrderFeed', userId);
  }
};

export const leaveOrderGroup = async (orderId: number): Promise<void> => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    await connection.invoke('LeaveOrderGroup', orderId);
  }
};

export const stopSignalRConnection = async (): Promise<void> => {
  if (connection) {
    try {
      await connection.stop();
    } catch {
      // ignore
    }
    connection = null;
  }
};

export const getConnectionState = (): string => {
  if (!connection) return 'Disconnected';
  return connection.state === signalR.HubConnectionState.Connected ? 'Connected' : connection.state;
};