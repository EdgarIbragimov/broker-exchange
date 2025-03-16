import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateBrokerDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;
}
