import { Module } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { BrokersController } from './brokers.controller';
import { JsonStorageService } from '../storage/json-storage.service';

@Module({
  controllers: [BrokersController],
  providers: [BrokersService, JsonStorageService],
  exports: [BrokersService],
})
export class BrokersModule {}
