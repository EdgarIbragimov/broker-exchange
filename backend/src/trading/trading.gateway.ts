import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TradingService } from './trading.service';

@WebSocketGateway({
  cors: {
    origin: '*', // В продакшн следует ограничить до конкретного домена
  },
})
export class TradingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TradingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly tradingService: TradingService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');

    // Подписываемся на обновления статуса торгов
    this.tradingService.tradingStatus$.subscribe((status) => {
      this.server.emit('tradingStatus', status);
    });
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Отправляем текущие настройки торгов при подключении
    const settings = await this.tradingService.getSettings();
    client.emit('tradingSettings', settings);

    // Если торги активны, отправляем последний статус
    if (settings.isActive) {
      this.tradingService.tradingStatus$.subscribe((status) => {
        client.emit('tradingStatus', status);
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
