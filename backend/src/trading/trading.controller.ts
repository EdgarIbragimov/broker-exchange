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
} from './models/trading-settings.interface';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('settings')
  getSettings(): Promise<ITradingSettings> {
    return this.tradingService.getSettings();
  }

  @Patch('settings')
  updateSettings(
    @Body() settingsDto: TradingSettingsDto,
  ): Promise<ITradingSettings> {
    return this.tradingService.updateSettings(settingsDto);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startTrading(): Promise<ITradingStatus> {
    return this.tradingService.startTrading();
  }

  @Post('stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  stopTrading(): void {
    this.tradingService.stopTrading();
  }
}
