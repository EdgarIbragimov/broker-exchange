import { Test, TestingModule } from '@nestjs/testing';
import { BrokersService } from '../brokers.service';
import { JsonStorageService } from '../../storage/json-storage.service';
import { NotFoundException } from '@nestjs/common';

describe('BrokersService', () => {
  let service: BrokersService;
  let storageService: JsonStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokersService,
        {
          provide: JsonStorageService,
          useValue: {
            loadData: jest.fn(),
            saveData: jest.fn(),
            appendData: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BrokersService>(BrokersService);
    storageService = module.get<JsonStorageService>(JsonStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a broker', async () => {
      const createBrokerDto = { name: 'Test Broker', balance: 1000 };
      const appendDataSpy = jest.spyOn(storageService, 'appendData');
      const result = await service.create(createBrokerDto);

      expect(result.name).toBe(createBrokerDto.name);
      expect(result.balance).toBe(createBrokerDto.balance);
      expect(appendDataSpy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of brokers', async () => {
      const brokers = [
        { id: '1', name: 'Broker 1', balance: 1000 },
        { id: '2', name: 'Broker 2', balance: 2000 },
      ];
      jest.spyOn(storageService, 'loadData').mockResolvedValue(brokers);

      const result = await service.findAll();
      expect(result).toEqual(brokers);
    });

    it('should return empty array when no brokers exist', async () => {
      jest.spyOn(storageService, 'loadData').mockResolvedValue(null);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a broker by id', async () => {
      const broker = { id: '1', name: 'Broker 1', balance: 1000 };
      jest.spyOn(storageService, 'loadData').mockResolvedValue([broker]);

      const result = await service.findOne('1');
      expect(result).toEqual(broker);
    });

    it('should throw NotFoundException when broker not found', async () => {
      jest.spyOn(storageService, 'loadData').mockResolvedValue([]);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
