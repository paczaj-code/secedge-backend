import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from './site.service';
import { Repository } from 'typeorm';
import { Site } from '../../entities/site.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('SiteService', () => {
  let service: SiteService;
  let repository: Repository<Site>;

  const mockSite = {
    id: 1,
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'ABC01',
    address: '123 Street',
    description: 'Test site',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockSite),
    save: jest.fn().mockResolvedValue(mockSite),
    createQueryBuilder: jest.fn(() => ({
      getMany: jest.fn().mockResolvedValue([mockSite]),
      getOne: jest.fn().mockResolvedValue(mockSite),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
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

  describe('create', () => {
    it('should create and save a new site', async () => {
      const createSiteDto = {
        name: 'ABC01',
        address: '123 Street',
        description: 'Test site',
      };

      const result = await service.create(createSiteDto);
      expect(repository.create).toHaveBeenCalledWith(createSiteDto);
      expect(repository.save).toHaveBeenCalledWith(mockSite);
      expect(result).toEqual(mockSite);
    });
  });

  describe('findAll', () => {
    it('should return an array of sites', async () => {
      const result = await service.findAll();
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(result).toEqual([mockSite]);
    });
  });

  describe('findOne', () => {
    it('should return a site when found', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = await service.findOne(uuid);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(result).toEqual(mockSite);
    });

    it('should throw NotFoundException if site is not found', async () => {
      // @ts-ignore
      mockRepository.createQueryBuilder = jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }));

      await expect(service.findOne('nonexistent-uuid')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on query failure', async () => {
      // @ts-ignore
      mockRepository.createQueryBuilder = jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('Query error')),
      }));

      await expect(service.findOne('uuid')).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update a site', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const updateSiteDto = { name: 'Updated Name' };

      const result = await service.update(uuid, updateSiteDto);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('site');
      expect(mockRepository.createQueryBuilder().update).toHaveBeenCalledWith(
        Site,
      );
      expect(mockRepository.createQueryBuilder().set).toHaveBeenCalledWith(
        updateSiteDto,
      );
      expect(mockRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'site.uuid = :uuid',
        { uuid },
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException if the site is not found', async () => {
      const uuid = 'nonexistent-uuid';
      const updateSiteDto = { name: 'Nonexistent Site' };

      // @ts-ignore
      mockRepository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      }));

      await expect(service.update(uuid, updateSiteDto)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if query fails', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const updateSiteDto = { name: 'Query Failure' };

      // @ts-ignore
      mockRepository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Query error')),
      }));

      await expect(service.update(uuid, updateSiteDto)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });
});
