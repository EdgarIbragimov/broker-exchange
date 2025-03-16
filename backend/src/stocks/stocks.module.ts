import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { JsonStorageService } from '../storage/json-storage.service';

@Module({
  controllers: [StocksController],
  providers: [StocksService, JsonStorageService],
  exports: [StocksService],
})
export class StocksModule {}
