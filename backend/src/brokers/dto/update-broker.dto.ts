import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateBrokerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;
}
