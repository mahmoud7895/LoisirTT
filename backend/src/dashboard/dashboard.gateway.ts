import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DashboardService } from './dashboard.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class DashboardGateway {
  @WebSocketServer() server: Server;

  constructor(private dashboardService: DashboardService) {}

  @SubscribeMessage('subscribeToDashboard')
  async handleSubscription() {
    try {
      const stats = await this.dashboardService.getStats();
      console.log('Sending dashboard data via WebSocket (subscribe):', stats);
      this.server.emit('dashboardData', stats); // Aligné avec les attentes du frontend
    } catch (error) {
      console.error('Erreur dans handleSubscription:', error);
      this.server.emit('error', {
        message: 'Impossible de récupérer les données',
      });
    }
  }

  async sendDashboardUpdate() {
    try {
      const stats = await this.dashboardService.getStats();
      console.log('Sending dashboard data via WebSocket (update):', stats);
      this.server.emit('dashboardData', stats); // Aligné avec les attentes du frontend
    } catch (error) {
      console.error('Erreur dans sendDashboardUpdate:', error);
      this.server.emit('error', {
        message: 'Impossible de mettre à jour les données',
      });
    }
  }
}
