import {
  Injectable,
  ConflictException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { JsonStorageService } from '../storage/json-storage.service';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { SupportedStockSymbol, IStock } from '../models/stock.interface';

@Injectable()
export class StocksService implements OnModuleInit {
  private readonly STORAGE_FILE = 'stocks';

  constructor(private readonly storageService: JsonStorageService) {}

  // Инициализация тестовых данных при запуске модуля
  async onModuleInit() {
    const existingStocks = await this.loadStockData();
    const stocksCount = Object.keys(existingStocks || {}).length;

    if (stocksCount === 0) {
      // Если акций еще нет, создаем тестовые данные
      const testStocks = {
        AAPL: {
          symbol: 'AAPL',
          companyName: 'Apple, Inc.',
          isActive: true,
          currentPrice: '$182.52',
          historicalData: this.generateHistoricalData(180, 120, 200),
        },
        SBUX: {
          symbol: 'SBUX',
          companyName: 'Starbucks, Inc.',
          isActive: true,
          currentPrice: '$91.32',
          historicalData: this.generateHistoricalData(90, 70, 110),
        },
        MSFT: {
          symbol: 'MSFT',
          companyName: 'Microsoft, Inc.',
          isActive: true,
          currentPrice: '$412.65',
          historicalData: this.generateHistoricalData(400, 350, 420),
        },
        CSCO: {
          symbol: 'CSCO',
          companyName: 'Cisco Systems, Inc.',
          isActive: false,
          currentPrice: '$47.84',
          historicalData: this.generateHistoricalData(45, 40, 55),
        },
        QCOM: {
          symbol: 'QCOM',
          companyName: 'QUALCOMM Incorporated',
          isActive: false,
          currentPrice: '$168.42',
          historicalData: this.generateHistoricalData(160, 140, 180),
        },
        AMZN: {
          symbol: 'AMZN',
          companyName: 'Amazon.com, Inc.',
          isActive: true,
          currentPrice: '$186.34',
          historicalData: this.generateHistoricalData(180, 140, 200),
        },
        TSLA: {
          symbol: 'TSLA',
          companyName: 'Tesla, Inc.',
          isActive: true,
          currentPrice: '$172.63',
          historicalData: this.generateHistoricalData(170, 150, 250),
        },
        AMD: {
          symbol: 'AMD',
          companyName: 'Advanced Micro Devices, Inc.',
          isActive: false,
          currentPrice: '$166.24',
          historicalData: this.generateHistoricalData(160, 120, 180),
        },
      };

      // Сохраняем тестовые данные
      await this.storageService.saveData(this.STORAGE_FILE, testStocks);
    }
  }

  // Метод для генерации исторических данных
  private generateHistoricalData(
    basePrice: number,
    minPrice: number,
    maxPrice: number,
    days = 30,
  ) {
    const data: { date: string; open: string }[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Генерируем случайную цену в заданном диапазоне
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
      let price = basePrice * randomFactor;

      // Ограничиваем цену заданными пределами
      price = Math.max(minPrice, Math.min(maxPrice, price));

      data.push({
        date: date.toISOString().split('T')[0], // Формат YYYY-MM-DD
        open: `$${price.toFixed(2)}`,
      });
    }

    return data;
  }

  // Загрузка данных из хранилища
  private async loadStockData(): Promise<Record<string, IStock>> {
    const data = await this.storageService.loadData<Record<string, IStock>>(
      this.STORAGE_FILE,
    );
    return data || {};
  }

  /**
   * Преобразует объект данных в экземпляр класса Stock
   */
  private toStockInstance(data: Partial<IStock>, symbol?: string): Stock {
    // Если это уже экземпляр Stock, возвращаем его
    if (data instanceof Stock) {
      return data;
    }

    // Иначе создаем новый экземпляр Stock из данных
    return new Stock({
      symbol: (data.symbol || symbol) as SupportedStockSymbol,
      companyName: data.companyName || '',
      isActive: data.isActive || false,
      currentPrice: data.currentPrice || '$0.00',
      historicalData: data.historicalData || [],
    });
  }

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const stocks = await this.loadStockData();

    if (stocks[createStockDto.symbol]) {
      throw new ConflictException(
        `Stock with symbol ${createStockDto.symbol} already exists`,
      );
    }

    const stock = new Stock({
      symbol: createStockDto.symbol as SupportedStockSymbol,
      companyName: createStockDto.companyName,
      isActive: createStockDto.isActive ?? false,
      currentPrice: createStockDto.currentPrice || '$0.00',
      historicalData:
        createStockDto.historicalData?.map((data) => ({
          date: data.date,
          open: data.open,
        })) || [],
    });

    stocks[createStockDto.symbol] = stock;
    await this.storageService.saveData(this.STORAGE_FILE, stocks);

    return stock;
  }

  async findAll(): Promise<Stock[]> {
    const stocks = await this.loadStockData();

    return Object.entries(stocks).map(([symbol, data]) =>
      this.toStockInstance(data, symbol),
    );
  }

  async findOne(symbol: string): Promise<Stock> {
    const stocks = await this.loadStockData();
    const stock = stocks[symbol];

    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    return this.toStockInstance(stock, symbol);
  }

  async update(symbol: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    const stocks = await this.loadStockData();

    if (!stocks[symbol]) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    // Важное изменение! Сохраняем все существующие данные акции
    // и обновляем только поля из updateStockDto
    const existingStock = stocks[symbol];

    // Создаем обновленную акцию, сохраняя все предыдущие данные
    const updatedStock = {
      ...existingStock,
      ...updateStockDto,
    };

    // Сохраняем обновленную акцию в хранилище
    stocks[symbol] = updatedStock;
    await this.storageService.saveData(this.STORAGE_FILE, stocks);

    return this.toStockInstance(updatedStock, symbol);
  }

  async remove(symbol: string): Promise<void> {
    const stocks = await this.loadStockData();

    if (!stocks[symbol]) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    // Удаляем акцию из объекта
    delete stocks[symbol];
    await this.storageService.saveData(this.STORAGE_FILE, stocks);
  }

  /**
   * Обновляет ТОЛЬКО статус участия акции в торгах, не трогая другие поля
   */
  async updateTradingStatus(symbol: string, isActive: boolean): Promise<Stock> {
    const allStocks = await this.loadStockData();
    const stockData = allStocks[symbol];

    if (!stockData) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    // Изменяем ТОЛЬКО поле isActive, не трогая остальные данные
    allStocks[symbol] = {
      ...stockData,
      isActive,
    };

    // Сохраняем обновленные данные
    await this.storageService.saveData(this.STORAGE_FILE, allStocks);

    // Возвращаем обновленную акцию
    return this.toStockInstance(allStocks[symbol], symbol);
  }
}
