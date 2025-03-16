import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../storage/json-storage.service';
import { Broker } from '../entities/broker.entity';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';

@Injectable()
export class BrokersService {
  private readonly STORAGE_FILE = 'brokers';

  constructor(private readonly storageService: JsonStorageService) {}

  async create(createBrokerDto: CreateBrokerDto): Promise<Broker> {
    const broker = new Broker({
      name: createBrokerDto.name,
      balance: createBrokerDto.balance || 0,
    });

    await this.storageService.appendData(this.STORAGE_FILE, broker);
    return broker;
  }

  async findAll(): Promise<Broker[]> {
    const brokers = await this.storageService.loadData<Broker[]>(
      this.STORAGE_FILE,
    );
    return brokers || [];
  }

  async findOne(id: string): Promise<Broker> {
    const brokers = await this.findAll();
    const broker = brokers.find((b) => b.id === id);

    if (!broker) {
      throw new NotFoundException(`Broker with ID ${id} not found`);
    }

    return broker;
  }

  async update(id: string, updateBrokerDto: UpdateBrokerDto): Promise<Broker> {
    const brokers = await this.findAll();
    const brokerIndex = brokers.findIndex((b) => b.id === id);

    if (brokerIndex === -1) {
      throw new NotFoundException(`Broker with ID ${id} not found`);
    }

    const updatedBroker = new Broker({
      ...brokers[brokerIndex],
      ...updateBrokerDto,
      updatedAt: new Date(),
    });

    brokers[brokerIndex] = updatedBroker;
    await this.storageService.saveData(this.STORAGE_FILE, brokers);

    return updatedBroker;
  }

  async remove(id: string): Promise<void> {
    const brokers = await this.findAll();
    const brokerIndex = brokers.findIndex((b) => b.id === id);

    if (brokerIndex === -1) {
      throw new NotFoundException(`Broker with ID ${id} not found`);
    }

    brokers.splice(brokerIndex, 1);
    await this.storageService.saveData(this.STORAGE_FILE, brokers);
  }
}
