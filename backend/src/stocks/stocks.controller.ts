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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('stocks')
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую акцию' })
  @ApiResponse({ status: 201, description: 'Акция успешно создана' })
  @ApiResponse({
    status: 409,
    description: 'Акция с таким символом уже существует',
  })
  create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех акций' })
  @ApiResponse({ status: 200, description: 'Список акций получен успешно' })
  findAll() {
    return this.stocksService.findAll();
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Получить информацию об акции по её символу' })
  @ApiParam({
    name: 'symbol',
    description: 'Символ акции (тикер)',
    example: 'AAPL',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация об акции получена успешно',
  })
  @ApiResponse({
    status: 404,
    description: 'Акция с указанным символом не найдена',
  })
  findOne(@Param('symbol') symbol: string) {
    return this.stocksService.findOne(symbol);
  }

  @Patch(':symbol')
  @ApiOperation({ summary: 'Обновить информацию об акции' })
  @ApiParam({
    name: 'symbol',
    description: 'Символ акции (тикер)',
    example: 'AAPL',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация об акции обновлена успешно',
  })
  @ApiResponse({
    status: 404,
    description: 'Акция с указанным символом не найдена',
  })
  update(
    @Param('symbol') symbol: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.stocksService.update(symbol, updateStockDto);
  }

  @Delete(':symbol')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить акцию' })
  @ApiParam({
    name: 'symbol',
    description: 'Символ акции (тикер)',
    example: 'AAPL',
  })
  @ApiResponse({ status: 204, description: 'Акция успешно удалена' })
  @ApiResponse({
    status: 404,
    description: 'Акция с указанным символом не найдена',
  })
  remove(@Param('symbol') symbol: string) {
    return this.stocksService.remove(symbol);
  }
}
