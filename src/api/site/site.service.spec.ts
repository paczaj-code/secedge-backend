import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from './site.service';
import { Repository } from 'typeorm';
import { Site } from '../../entities/site.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SiteService', () => {
  let service: SiteService;

  let siteRepository: jest.Mocked<Repository<Site>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: getRepositoryToken(Site),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              getMany: jest.fn(),
              getOne: jest.fn(),
              update: jest.fn().mockReturnThis(),
              delete: jest.fn().mockReturnThis(),
              execute: jest.fn(),
              set: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
    siteRepository = module.get<Repository<Site>>(
      getRepositoryToken(Site),
    ) as jest.Mocked<Repository<Site>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a site', async () => {
      const dto = {
        name: 'ABC01',
        address: '123 Main St',
        description: 'Test site',
      };
      const savedSite = { id: 1, uuid: 'uuid-123', ...dto };
      siteRepository.create.mockReturnValue(savedSite as Site);
      siteRepository.save.mockResolvedValue(savedSite as Site);

      const result = await service.create(dto as any);

      expect(siteRepository.create).toHaveBeenCalledWith(dto);
      expect(siteRepository.save).toHaveBeenCalledWith(savedSite);
      expect(result).toEqual(savedSite);
    });
  });

  describe('findAll', () => {
    it('should return all sites', async () => {
      const sites = [{ id: 1, uuid: 'uuid-123', name: 'ABC01' }];
      // @ts-ignore
      siteRepository.createQueryBuilder().getMany.mockResolvedValue(sites);

      const result = await service.findAll();

      expect(result).toEqual(sites);
    });
  });

  describe('findOne', () => {
    it('should return a site by uuid', async () => {
      const site = { id: 1, uuid: 'uuid-123', name: 'ABC01' };
      // @ts-ignore
      siteRepository.createQueryBuilder().getOne.mockResolvedValue(site);

      const result = await service.findOne('uuid-123');

      expect(siteRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(site);
    });
  });

  describe('remove', () => {
    it('should delete a site by uuid', async () => {
      const deleteResult = { affected: 1 };

      siteRepository
        .createQueryBuilder()
        // @ts-ignore
        .execute.mockResolvedValue(deleteResult);

      const result = await service.remove('uuid-123');

      expect(siteRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(deleteResult);
    });
  });

  describe('update', () => {
    it('should update a site by uuid', async () => {
      const uuid = 'uuid-123';
      const updateDto = { name: 'Updated Name' };
      const updateResult = { affected: 1 };

      siteRepository
        .createQueryBuilder()
        .update(Site)
        .set(updateDto)
        .where('site.uuid = :uuid', { uuid })
        // @ts-ignore
        .execute.mockResolvedValue(updateResult);
      const result = await service.update(uuid, updateDto as any);
      expect(siteRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(updateResult);
      expect(siteRepository.createQueryBuilder().update).toHaveBeenCalledWith(
        Site,
      );
      expect(
        siteRepository.createQueryBuilder().update().set,
      ).toHaveBeenCalledWith(updateDto);
      expect(siteRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'site.uuid = :uuid',
        { uuid },
      );
    });
  });
});
