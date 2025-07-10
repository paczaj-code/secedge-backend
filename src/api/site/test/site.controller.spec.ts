import { Test, TestingModule } from '@nestjs/testing';
import { SiteController } from '../site.controller';
import { CreateSiteDto } from '../dto/create-site.dto';
import { UpdateSiteDto } from '../dto/update-site.dto';
import { SiteService } from '../site.service';
import { AuthorizationGuard } from '../../../guards/role.quard';

describe('SiteController', () => {
  let controller: SiteController;
  let service: SiteService;

  beforeEach(async () => {
    const mockSiteService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteController],
      providers: [{ provide: SiteService, useValue: mockSiteService }],
    })
      .overrideGuard(AuthorizationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SiteController>(SiteController);
    service = module.get<SiteService>(SiteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call SiteService.create with correct arguments', async () => {
      const createDto: CreateSiteDto = {
        name: 'WAW01',
        address: '123 St',
        description: 'Test description',
      };
      service.create = jest.fn().mockResolvedValue(createDto);
      expect(await controller.create(createDto)).toEqual(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of sites', async () => {
      const mockSites = [
        { name: 'WAW01', address: '123 St', description: 'Test description' },
      ];
      service.findAll = jest.fn().mockResolvedValue(mockSites);
      expect(await controller.findAll()).toEqual(mockSites);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single site by UUID', async () => {
      const uuid = 'test-uuid';
      const mockSite = {
        name: 'WAW01',
        address: '123 St',
        description: 'Test description',
      };
      service.findOne = jest.fn().mockResolvedValue(mockSite);
      expect(await controller.findOne(uuid)).toEqual(mockSite);
      expect(service.findOne).toHaveBeenCalledWith(uuid);
    });
  });

  describe('update', () => {
    it('should update a site and return the result', async () => {
      const uuid = 'test-uuid';
      const updateDto: UpdateSiteDto = { name: 'Updated Name' };
      const mockResponse = { affected: 1 };
      service.update = jest.fn().mockResolvedValue(mockResponse);
      expect(await controller.update(uuid, updateDto)).toEqual(mockResponse);
      expect(service.update).toHaveBeenCalledWith(uuid, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a site and return the result', async () => {
      const uuid = 'test-uuid';
      const mockResponse = { affected: 1 };
      service.remove = jest.fn().mockResolvedValue(mockResponse);
      expect(await controller.remove(uuid)).toEqual(mockResponse);
      expect(service.remove).toHaveBeenCalledWith(uuid);
    });
  });
});
