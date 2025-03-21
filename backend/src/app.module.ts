import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksModule } from './stocks/stocks.module';
import { BrokersModule } from './brokers/brokers.module';
import { TradingModule } from './trading/trading.module';

@Module({
  imports: [StocksModule, BrokersModule, TradingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
