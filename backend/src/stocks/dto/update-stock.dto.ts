import {
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HistoricalDataDto } from './create-stock.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Символ акции (тикер)',
    example: 'AAPL',
    required: false,
  })
  @IsString()
  @IsOptional()
  symbol?: string;

  @ApiProperty({
    description: 'Название компании',
    example: 'Apple Inc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: 'Флаг активности акции в торгах',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Текущая цена акции в формате $X.XX',
    example: '$150.00',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentPrice?: string;

  @ApiProperty({
    description: 'Исторические данные о ценах акции',
    type: [HistoricalDataDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataDto)
  historicalData?: HistoricalDataDto[];
}
