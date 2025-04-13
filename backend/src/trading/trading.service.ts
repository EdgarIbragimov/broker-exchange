import { Injectable, Logger } from '@nestjs/common';
import {
  ITradingSettings,
  ITradingStatus,
} from '../models/trading-settings.interface';
import { JsonStorageService } from '../storage/json-storage.service';
import { StocksService } from '../stocks/stocks.service';
import { TradingSettingsDto } from './dto/trading-settings.dto';
import { Stock } from '../entities/stock.entity';
import { IStockPrice } from '../models/stock.interface';
import { Subject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);
  private readonly SETTINGS_FILE = 'trading-settings';
  private readonly ORIGINAL_STOCKS_BACKUP_FILE = 'original-stocks-backup';
  private settings: ITradingSettings;
  private tradingSubscription: Subscription | null;
  private tradingStatusSubject = new Subject<ITradingStatus>();
  private originalDataSaved = false;

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
      // Используем настройки как есть, так как они уже хранятся как строки
      this.settings = settings;

      // Если торги были активны при выключении сервера, перезапускаем их
      if (this.settings.isActive) {
        void this.startTrading();
      }
    } else {
      // Настройки по умолчанию
      this.settings = {
        startDate: new Date().toISOString(), // Используем ISO строку
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
      // Преобразуем Date в строку ISO
      startDate:
        settingsDto.startDate instanceof Date
          ? settingsDto.startDate.toISOString()
          : settingsDto.startDate,
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

    // Save original stock data if not already saved
    if (!this.originalDataSaved) {
      await this.saveOriginalStocksData();
      this.originalDataSaved = true;
    }

    this.settings.isActive = true;
    this.settings.currentDate = this.settings.startDate;
    await this.saveSettings();

    // Start the interval for trading simulation
    const intervalTime = this.settings.speedFactor * 1000;
    this.tradingSubscription = interval(intervalTime)
      .pipe(takeWhile(() => this.settings.isActive))
      .subscribe(() => {
        this.simulateTrading().catch((error: Error) => {
          this.logger.error(`Error in trading simulation: ${error.message}`);
        });
      });

    // Run first iteration immediately
    return this.simulateTrading();
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
      // Advance current date by one day
      const currentDateObj = new Date(
        this.settings.currentDate || this.settings.startDate,
      );
      currentDateObj.setDate(currentDateObj.getDate() + 1);
      this.settings.currentDate = currentDateObj.toISOString();
      await this.saveSettings();

      // Get active stocks
      const stocks = await this.stocksService.findAll();
      const activeStocks = stocks.filter((stock) => stock.isActive);

      // Update stock prices based on historical data
      const updatedPrices = await this.updateStockPrices(
        activeStocks,
        currentDateObj,
      );

      // Create and send trading status
      const status: ITradingStatus = {
        isActive: this.settings.isActive,
        currentDate: this.settings.currentDate,
        stockPrices: updatedPrices.map((stock) => ({
          symbol: stock.symbol,
          price: stock.currentPrice,
        })),
      };

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

  // Метод для сохранения копии исходных данных акций
  private async saveOriginalStocksData(): Promise<void> {
    try {
      this.logger.log('Сохранение копии исходных данных акций...');

      // Получаем все акции
      const stocks = await this.stocksService.findAll();

      // Создаем объект для хранения данных
      const originalStocksData = {};

      // Сохраняем данные каждой акции
      for (const stock of stocks) {
        originalStocksData[stock.symbol] = {
          symbol: stock.symbol,
          companyName: stock.companyName,
          isActive: stock.isActive,
          currentPrice: stock.currentPrice,
          historicalData: [...stock.historicalData],
        };
      }

      // Сохраняем данные в файл
      await this.storageService.saveData(
        this.ORIGINAL_STOCKS_BACKUP_FILE,
        originalStocksData,
      );

      this.logger.log('Копия исходных данных акций успешно сохранена');
    } catch (error) {
      this.logger.error(
        `Ошибка при сохранении исходных данных акций: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Сбрасывает данные симуляции к первоначальному состоянию
   * Восстанавливает исходные котировки и текущую дату из бэкапа
   */
  async resetSimulation(): Promise<ITradingStatus> {
    // Останавливаем текущую симуляцию, если она активна
    if (this.tradingSubscription) {
      this.stopTrading();
    }

    try {
      this.logger.log('Начало сброса данных симуляции...');

      // Получаем все акции
      const stocks = await this.stocksService.findAll();

      // Загружаем исходные данные
      const originalStocksDataOrNull = await this.storageService.loadData(
        this.ORIGINAL_STOCKS_BACKUP_FILE,
      );

      let originalStocksData: Record<string, any>;

      // Если бэкап не найден, используем данные из основного файла stocks.json
      if (!originalStocksDataOrNull) {
        this.logger.warn(
          'Бэкап исходных данных не найден, используем stocks.json',
        );

        const STORAGE_FILE = path.resolve(
          process.cwd(),
          'storage',
          'stocks.json',
        );

        if (!fs.existsSync(STORAGE_FILE)) {
          throw new Error(
            `Файл с исходными данными не найден: ${STORAGE_FILE}`,
          );
        }

        this.logger.log(`Загрузка исходных данных из файла: ${STORAGE_FILE}`);

        const rawData = fs.readFileSync(STORAGE_FILE, 'utf8');
        originalStocksData = JSON.parse(rawData) as Record<string, any>;
      } else {
        this.logger.log(
          'Найден бэкап исходных данных, используем его для восстановления',
        );
        originalStocksData = originalStocksDataOrNull;
      }

      // Создаем объект для хранения восстановленных акций
      const restoredStocks = {};

      // Перебираем все акции и обновляем их данные из исходных данных
      for (const stock of stocks) {
        const originalStock = originalStocksData[stock.symbol];

        if (originalStock) {
          // Устанавливаем текущую цену на основе исходных данных
          stock.updateCurrentPrice(originalStock.currentPrice);

          // Заменяем исторические данные исходными
          stock.historicalData = [...originalStock.historicalData];

          // Добавляем в объект восстановленных акций
          restoredStocks[stock.symbol] = {
            symbol: stock.symbol,
            companyName: originalStock.companyName,
            isActive: stock.isActive, // Сохраняем текущий статус активности
            currentPrice: originalStock.currentPrice,
            historicalData: [...originalStock.historicalData],
          };

          this.logger.log(`Восстановлены данные для акции: ${stock.symbol}`);
        } else {
          this.logger.warn(
            `Не найдены исходные данные для акции: ${stock.symbol}`,
          );

          // Добавляем текущую акцию, если она не найдена в исходных данных
          restoredStocks[stock.symbol] = {
            symbol: stock.symbol,
            companyName: stock.companyName,
            isActive: stock.isActive,
            currentPrice: stock.currentPrice,
            historicalData: [],
          };
        }
      }

      // Сохраняем восстановленные данные акций в файл
      await this.storageService.saveData('stocks', restoredStocks);

      // Восстанавливаем исходную текущую дату, сбрасывая её к стартовой дате
      this.settings.currentDate = this.settings.startDate;
      await this.saveSettings();

      // Создаем статус торгов для возврата
      const status: ITradingStatus = {
        isActive: false,
        currentDate: this.settings.startDate,
        stockPrices: stocks.map((stock) => ({
          symbol: stock.symbol,
          price: stock.currentPrice,
        })),
      };

      // Отправляем обновленный статус подписчикам
      this.tradingStatusSubject.next(status);

      this.logger.log('Сброс данных симуляции успешно завершен.');
      return status;
    } catch (error) {
      this.logger.error(`Ошибка при сбросе данных симуляции: ${error.message}`);
      throw error;
    }
  }
}
