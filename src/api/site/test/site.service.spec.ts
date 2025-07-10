// site.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from '../site.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../../../entities/site.entity';
import { NotFoundException } from '@nestjs/common';

describe('SiteService', () => {
  let service: SiteService;
  let repository: Repository<Site>;

  const mockSite = {
    id: 1,
    uuid: 'test-uuid',
    name: 'Test Site',
    address: '123 Test St',
    description: 'Sample description',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockSite),
    save: jest.fn().mockResolvedValue(mockSite),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(mockSite),
      getMany: jest.fn().mockResolvedValue([mockSite]),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: getRepositoryToken(Site),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
    repository = module.get<Repository<Site>>(getRepositoryToken(Site));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new site', async () => {
      const createSiteDto = {
        name: 'Test Site',
        address: '123 Test St',
        description: 'Sample description',
      };
      const result = await service.create(createSiteDto);

      expect(repository.create).toHaveBeenCalledWith(createSiteDto);
      expect(repository.save).toHaveBeenCalledWith(mockSite);
      expect(result).toEqual(mockSite);
    });
  });

  describe('findAll', () => {
    it('should return all sites', async () => {
      const result = await service.findAll();
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(result).toEqual([mockSite]);
    });
  });

  describe('findOne', () => {
    it('should return a site by UUID', async () => {
      const result = await service.findOne('test-uuid');
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(result).toEqual(mockSite);
    });

    it('should throw NotFoundException if site not found', async () => {
      jest
        .spyOn(repository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(null);
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a site', async () => {
      const updateSiteDto = { address: 'Updated Address' };
      const result = await service.update('test-uuid', updateSiteDto);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('sites');
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException if site not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(service.update('invalid-uuid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a site by UUID', async () => {
      const result = await service.remove('test-uuid');

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('sites');
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException if site not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(service.remove('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
