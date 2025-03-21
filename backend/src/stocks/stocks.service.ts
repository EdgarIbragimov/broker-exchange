import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JsonStorageService } from '../storage/json-storage.service';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { SupportedStockSymbol, IStock } from '../models/stock.interface';

@Injectable()
export class StocksService {
  private readonly STORAGE_FILE = 'stocks';

  constructor(private readonly storageService: JsonStorageService) {}

  /**
   * Преобразует объект данных в экземпляр класса Stock
   */
  private toStockInstance(data: Partial<IStock>): Stock {
    // Если это уже экземпляр Stock, возвращаем его
    if (data instanceof Stock) {
      return data;
    }

    // Иначе создаем новый экземпляр Stock из данных
    return new Stock({
      symbol: data.symbol as SupportedStockSymbol,
      companyName: data.companyName,
      isActive: data.isActive,
      currentPrice: data.currentPrice,
      historicalData: data.historicalData || [],
    });
  }

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const existingStocks =
      (await this.storageService.loadData<Stock[]>(this.STORAGE_FILE)) || [];
    if (
      existingStocks.some((stock) => stock.symbol === createStockDto.symbol)
    ) {
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

    await this.storageService.appendData(this.STORAGE_FILE, stock);
    return stock;
  }

  async findAll(): Promise<Stock[]> {
    const stocksData = await this.storageService.loadData<
      Stock[] | Record<string, Stock>
    >(this.STORAGE_FILE);

    if (!stocksData) {
      return [];
    }

    // Если данные - массив, преобразуем каждый элемент в экземпляр Stock
    if (Array.isArray(stocksData)) {
      return stocksData.map((item) => this.toStockInstance(item));
    }

    // Если данные - объект, преобразуем каждое значение в экземпляр Stock
    return Object.values(stocksData).map((stockData) =>
      this.toStockInstance(stockData),
    );
  }

  async findOne(symbol: string): Promise<Stock> {
    const stocks = await this.findAll();

    const stock = stocks.find((s) => s.symbol === symbol);

    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    return stock;
  }

  async update(symbol: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    const stocks = await this.findAll();
    const stockIndex = stocks.findIndex((s) => s.symbol === symbol);

    if (stockIndex === -1) {
      throw new NotFoundException(`Stock ${symbol} not found`);
    }

    const updatedStock = new Stock({
      ...stocks[stockIndex],
      ...updateStockDto,
    });

    stocks[stockIndex] = updatedStock;
    await this.storageService.saveData(this.STORAGE_FILE, stocks);

    return updatedStock;
  }

  async remove(symbol: string): Promise<void> {
    const stocks = await this.findAll();
    const stockIndex = stocks.findIndex((s) => s.symbol === symbol);

    if (stockIndex === -1) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    stocks.splice(stockIndex, 1);

    await this.storageService.saveData(this.STORAGE_FILE, stocks);
  }
}
