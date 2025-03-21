import { IsDate, IsNumber, IsBoolean, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TradingSettingsDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNumber()
  @Min(0.1)
  speedFactor: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
