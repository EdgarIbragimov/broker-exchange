import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingSettingsDto } from './dto/trading-settings.dto';
import {
  ITradingSettings,
  ITradingStatus,
} from '../models/trading-settings.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('trading')
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Получить текущие настройки торгов' })
  @ApiResponse({
    status: 200,
    description: 'Настройки торгов получены успешно',
  })
  getSettings(): Promise<ITradingSettings> {
    return this.tradingService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Обновить настройки торгов' })
  @ApiResponse({
    status: 200,
    description: 'Настройки торгов обновлены успешно',
  })
  updateSettings(
    @Body() settingsDto: TradingSettingsDto,
  ): Promise<ITradingSettings> {
    return this.tradingService.updateSettings(settingsDto);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Запустить торги' })
  @ApiResponse({
    status: 200,
    description: 'Торги успешно запущены',
  })
  async startTrading(): Promise<ITradingStatus> {
    return this.tradingService.startTrading();
  }

  @Post('stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Остановить торги' })
  @ApiResponse({
    status: 204,
    description: 'Торги успешно остановлены',
  })
  stopTrading(): void {
    this.tradingService.stopTrading();
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сбросить данные симуляции' })
  @ApiResponse({
    status: 200,
    description: 'Данные симуляции успешно сброшены',
  })
  async resetSimulation(): Promise<ITradingStatus> {
    return this.tradingService.resetSimulation();
  }
}
