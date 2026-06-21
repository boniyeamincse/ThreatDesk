import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);
      client.join(`user:${userId}`);
      console.log(`User ${userId} connected: ${client.id}`);
    }
    client.join('broadcast');
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
      console.log(`User ${userId} disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): string {
    return 'pong';
  }

  // Alert Events
  emitAlertCreated(alert: any) {
    this.server.to('broadcast').emit('alert.created', {
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      source: alert.source,
      status: alert.status,
      timestamp: new Date(),
    });
  }

  emitAlertUpdated(alert: any) {
    this.server.to('broadcast').emit('alert.updated', {
      id: alert.id,
      status: alert.status,
      verdict: alert.verdict,
      timestamp: new Date(),
    });
  }

  emitAlertAssigned(alert: any, assignedToUserId: string) {
    this.server.to(`user:${assignedToUserId}`).emit('alert.assigned', {
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      timestamp: new Date(),
    });
  }

  emitAlertEscalated(alert: any) {
    this.server.to('broadcast').emit('alert.escalated', {
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      timestamp: new Date(),
    });
  }

  emitAlertClosed(alert: any) {
    this.server.to('broadcast').emit('alert.closed', {
      id: alert.id,
      verdict: alert.verdict,
      timestamp: new Date(),
    });
  }

  // Ticket Events
  emitTicketCreated(ticket: any) {
    this.server.to('broadcast').emit('ticket.created', {
      id: ticket.id,
      title: ticket.title,
      severity: ticket.severity,
      status: ticket.status,
      timestamp: new Date(),
    });
  }

  emitTicketUpdated(ticket: any) {
    this.server.to('broadcast').emit('ticket.updated', {
      id: ticket.id,
      status: ticket.status,
      severity: ticket.severity,
      timestamp: new Date(),
    });
  }

  // Incident Events
  emitIncidentCreated(incident: any) {
    this.server.to('broadcast').emit('incident.created', {
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      timestamp: new Date(),
    });
  }

  emitIncidentUpdated(incident: any) {
    this.server.to('broadcast').emit('incident.updated', {
      id: incident.id,
      status: incident.status,
      timestamp: new Date(),
    });
  }

  // SLA Events
  emitSLABreach(alert: any) {
    this.server.to('broadcast').emit('sla.breached', {
      alertId: alert.id,
      alertName: alert.name,
      severity: alert.severity,
      timestamp: new Date(),
    });
  }

  // Log Source Events
  emitLogSourceDisconnected(source: any) {
    this.server.to('broadcast').emit('logsource.disconnected', {
      id: source.id,
      name: source.name,
      type: source.type,
      timestamp: new Date(),
    });
  }

  emitLogSourceConnected(source: any) {
    this.server.to('broadcast').emit('logsource.connected', {
      id: source.id,
      name: source.name,
      type: source.type,
      timestamp: new Date(),
    });
  }

  // Notification Events
  emitNotificationCreated(notification: any, userId?: string) {
    if (userId) {
      this.server.to(`user:${userId}`).emit('notification.created', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: new Date(),
      });
    } else {
      this.server.to('broadcast').emit('notification.created', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }

  // Broadcast to all
  broadcast(event: string, data: any) {
    this.server.to('broadcast').emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Get user connection status
  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }
}
