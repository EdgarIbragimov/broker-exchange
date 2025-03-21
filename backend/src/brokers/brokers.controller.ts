import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';

@Controller('brokers')
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  @Post()
  create(@Body() createBrokerDto: CreateBrokerDto) {
    return this.brokersService.create(createBrokerDto);
  }

  @Get()
  findAll() {
    return this.brokersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brokersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrokerDto: UpdateBrokerDto) {
    return this.brokersService.update(id, updateBrokerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.brokersService.remove(id);
  }
}
