import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class HistoricalDataDto {
  @ApiProperty({
    description: 'Дата данных в формате MM/DD/YYYY',
    example: '01/15/2023',
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Цена открытия в формате $X.XX',
    example: '$150.50',
  })
  @IsString()
  open: string;
}

export class CreateStockDto {
  @ApiProperty({
    description: 'Символ акции (тикер)',
    example: 'AAPL',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Название компании',
    example: 'Apple Inc.',
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Флаг активности акции в торгах',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = false;

  @ApiProperty({
    description: 'Текущая цена акции в формате $X.XX',
    example: '$150.00',
    required: false,
    default: '$0',
  })
  @IsString()
  @IsOptional()
  currentPrice?: string = '$0';

  @ApiProperty({
    description: 'Исторические данные о ценах акции',
    type: [HistoricalDataDto],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataDto)
  historicalData?: HistoricalDataDto[] = [];
}
