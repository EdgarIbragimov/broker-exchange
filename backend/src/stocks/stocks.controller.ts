import {
  Get,
  Post,
  Delete,
  Controller,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stocksService.findAll();
  }

  @Get(':symbol')
  findOne(@Param('symbol') symbol: string) {
    return this.stocksService.findOne(symbol);
  }

  @Patch(':symbol')
  update(
    @Param('symbol') symbol: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.stocksService.update(symbol, updateStockDto);
  }

  @Delete(':symbol')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('symbol') symbol: string) {
    return this.stocksService.remove(symbol);
  }
}
