import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HistoricalDataDto {
  @IsString()
  date: string;

  @IsString()
  open: string;
}

export class CreateStockDto {
  @IsString()
  symbol: string;

  @IsString()
  companyName: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = false;

  @IsString()
  @IsOptional()
  currentPrice?: string = '$0';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataDto)
  historicalData?: HistoricalDataDto[] = [];
}
