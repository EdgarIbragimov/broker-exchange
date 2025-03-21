import { Injectable, Logger } from '@nestjs/common';
import {
  ITradingSettings,
  ITradingStatus,
} from './models/trading-settings.interface';
import { JsonStorageService } from '../storage/json-storage.service';
import { StocksService } from '../stocks/stocks.service';
import { TradingSettingsDto } from './dto/trading-settings.dto';
import { Stock } from '../entities/stock.entity';
import { IStockPrice } from '../models/stock.interface';
import { Subject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private readonly SETTINGS_FILE = 'trading-settings';
  private settings: ITradingSettings;
  private tradingSubscription: Subscription | null;
  private tradingStatusSubject = new Subject<ITradingStatus>();

  constructor(
    private readonly storageService: JsonStorageService,
    private readonly stocksService: StocksService,
  ) {
    this.loadSettings().catch((error: Error) => {
      this.logger.error(`Failed to load trading settings: ${error.message}`);
    });
  }

  get tradingStatus$() {
    return this.tradingStatusSubject.asObservable();
  }

  private async loadSettings(): Promise<void> {
    const settings = await this.storageService.loadData<ITradingSettings>(
      this.SETTINGS_FILE,
    );
    if (settings) {
      // Преобразуем строки дат в объекты Date
      this.settings = {
        ...settings,
        startDate: new Date(settings.startDate),
        currentDate: settings.currentDate
          ? new Date(settings.currentDate)
          : undefined,
      };

      // Если торги были активны при выключении сервера, перезапускаем их
      if (this.settings.isActive) {
        void this.startTrading();
      }
    } else {
      // Настройки по умолчанию
      this.settings = {
        startDate: new Date(),
        speedFactor: 1,
        isActive: false,
      };
      await this.saveSettings();
    }
  }

  private async saveSettings(): Promise<void> {
    await this.storageService.saveData(this.SETTINGS_FILE, this.settings);
  }

  getSettings(): Promise<ITradingSettings> {
    return Promise.resolve(this.settings);
  }

  async updateSettings(
    settingsDto: TradingSettingsDto,
  ): Promise<ITradingSettings> {
    const wasActive = this.settings.isActive;

    this.settings = {
      ...this.settings,
      startDate: settingsDto.startDate,
      speedFactor: settingsDto.speedFactor,
      isActive: settingsDto.isActive ?? this.settings.isActive,
    };

    await this.saveSettings();

    // Если статус активности изменился
    if (wasActive && !this.settings.isActive) {
      this.stopTrading();
    } else if (!wasActive && this.settings.isActive) {
      void this.startTrading();
    }

    return this.settings;
  }

  async startTrading(): Promise<ITradingStatus> {
    if (this.tradingSubscription) {
      this.stopTrading();
    }

    this.settings.isActive = true;
    this.settings.currentDate = new Date(this.settings.startDate);
    await this.saveSettings();

    // Интервал в миллисекундах (speedFactor в секундах * 1000)
    const intervalTime = this.settings.speedFactor * 1000;

    this.tradingSubscription = interval(intervalTime)
      .pipe(takeWhile(() => this.settings.isActive))
      .subscribe(() => {
        this.simulateTrading().catch((error: Error) => {
          this.logger.error(`Error in trading simulation: ${error.message}`);
        });
      });

    // Сразу вызываем первую итерацию
    const status = await this.simulateTrading();
    return status;
  }

  stopTrading(): void {
    if (this.tradingSubscription) {
      this.tradingSubscription.unsubscribe();
      this.tradingSubscription = null;
    }

    this.settings.isActive = false;
    this.saveSettings().catch((error: Error) => {
      this.logger.error(`Failed to save trading settings: ${error.message}`);
    });
  }

  private async simulateTrading(): Promise<ITradingStatus> {
    try {
      // Увеличиваем текущую дату на один день
      const currentDate = new Date(
        this.settings.currentDate || this.settings.startDate,
      );
      currentDate.setDate(currentDate.getDate() + 1);
      this.settings.currentDate = currentDate;

      // Сохраняем обновленные настройки
      await this.saveSettings();

      // Получаем все акции
      const stocks = await this.stocksService.findAll();

      // Акции активные в торгах
      const activeStocks = stocks.filter((stock) => stock.isActive);

      // Обновляем цены акций на основе исторических данных
      const updatedPrices = await this.updateStockPrices(
        activeStocks,
        currentDate,
      );

      // Создаем статус торгов
      const status: ITradingStatus = {
        isActive: this.settings.isActive,
        currentDate,
        stockPrices: updatedPrices.map((stock) => ({
          symbol: stock.symbol,
          price: stock.currentPrice,
        })),
      };

      // Отправляем обновленный статус подписчикам
      this.tradingStatusSubject.next(status);

      return status;
    } catch (error: unknown) {
      this.logger.error(
        `Error during trading simulation: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private async updateStockPrices(
    stocks: Stock[],
    currentDate: Date,
  ): Promise<Stock[]> {
    const dateString = this.formatDate(currentDate);
    const updatedStocks: Stock[] = [];

    for (const stock of stocks) {
      // Ищем историческую цену для текущей даты
      const historicalPrice = stock.historicalData.find(
        (data) => data.date === dateString,
      );

      if (historicalPrice) {
        // Если нашли историческую цену, обновляем текущую
        stock.updateCurrentPrice(historicalPrice.open);
      } else {
        // Если нет исторических данных на эту дату, генерируем случайное изменение
        const currentPrice = stock.getCurrentPriceAsNumber();
        const change = this.getRandomPriceChange(currentPrice);
        const newPrice = Math.max(0.01, currentPrice + change).toFixed(2);

        // Обновляем текущую цену
        stock.updateCurrentPrice(`$${newPrice}`);

        // Добавляем в исторические данные
        const newHistoricalData: IStockPrice = {
          date: dateString,
          open: `$${newPrice}`,
        };
        stock.addHistoricalData(newHistoricalData);
      }

      // if (stock.symbol === 'AAPL') {
      //   console.log(`AAPL price at ${dateString}: ${stock.currentPrice}`);
      // }

      // Обновляем акцию в хранилище
      await this.stocksService.update(stock.symbol, {
        currentPrice: stock.currentPrice,
        historicalData: stock.historicalData,
      });

      updatedStocks.push(stock);
    }

    return updatedStocks;
  }

  // Генерирует случайное изменение цены в диапазоне ±5%
  private getRandomPriceChange(price: number): number {
    const maxChange = price * 0.05; // 5% от текущей цены
    return (Math.random() * 2 - 1) * maxChange;
  }

  // Форматирует дату в строку вида "MM/DD/YYYY"
  private formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
