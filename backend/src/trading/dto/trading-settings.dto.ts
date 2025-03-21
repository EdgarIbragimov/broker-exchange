import { IsDate, IsNumber, IsBoolean, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TradingSettingsDto {
  @ApiProperty({
    description: 'Начальная дата для симуляции торгов',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Множитель скорости симуляции. Минимальное значение 0.1',
    example: 1.0,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  speedFactor: number;

  @ApiProperty({
    description: 'Флаг активности торгов',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
