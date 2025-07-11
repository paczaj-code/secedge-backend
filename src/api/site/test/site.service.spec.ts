// site.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from '../site.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../../../entities/site.entity';
import { HttpException, NotFoundException } from '@nestjs/common';

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
    findOne: jest.fn().mockResolvedValue(mockSite),
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
    it('powinien utworzyć nowy site', async () => {
      const createSiteDto = {
        uuid: 'test-uuid',
        name: 'Test Site',
        address: '123 Test St',
        description: 'Sample description',
      };

      // Mockowanie metody isSiteNameUnique, aby zwracała true
      jest.spyOn(service, 'isSiteNameUnique').mockResolvedValue(true);

      // Wywołanie metody create
      const result = await service.create(createSiteDto);

      // Sprawdzenie wywołań metod
      expect(repository.create).toHaveBeenCalledWith(createSiteDto);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(createSiteDto),
      );
      expect(result).toEqual(mockSite);
    });

    it('powinien rzucić wyjątek, gdy nazwa witryny nie jest unikalna', async () => {
      const createSiteDto = {
        name: 'WAW01',
        address: '123 Test Street',
        description: 'Test description',
      };

      // Mockowanie metody isSiteNameUnique, aby zwracała false
      jest.spyOn(service, 'isSiteNameUnique').mockResolvedValue(false);

      await expect(service.create(createSiteDto)).rejects.toThrow();
    });

    it('powinien wywołać metodę isSiteNameUnique przed utworzeniem witryny', async () => {
      const createSiteDto = {
        name: 'WAW01',
        address: '123 Test Street',
        description: 'Test description',
      };

      // Mockowanie metody isSiteNameUnique
      const isSiteNameUniqueSpy = jest
        .spyOn(service, 'isSiteNameUnique')
        .mockResolvedValue(true);

      await service.create(createSiteDto);

      // Sprawdzenie, czy metoda isSiteNameUnique została wywołana z poprawną nazwą
      expect(isSiteNameUniqueSpy).toHaveBeenCalledWith(createSiteDto.name);
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
    it('powinien zaktualizować istniejącą witrynę', async () => {
      const uuid = 'test-uuid';
      const updateSiteDto = {
        name: 'Updated Site Name',
        address: 'Updated Address',
      };

      // Mockowanie metody isSiteNameUnique, aby zwracała true
      jest.spyOn(service, 'isSiteNameUnique').mockResolvedValue(true);

      const result = await service.update(uuid, updateSiteDto);

      // Sprawdzenie wywołań metod
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('sites');
      expect(result).toEqual({ affected: 1 });
    });

    it('powinien rzucić NotFoundException, gdy witryna nie istnieje', async () => {
      const uuid = 'non-existent-uuid';
      const updateSiteDto = { name: 'Updated Site Name' };

      // Mockowanie findOne, aby zwracało null
      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.update(uuid, updateSiteDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('powinien rzucić HttpException, gdy nazwa witryny nie jest unikalna', async () => {
      const uuid = 'test-uuid';
      const updateSiteDto = { name: 'Duplicate Site Name' };

      // Mockowanie findOne, aby zwróciło istniejącą witrynę
      mockRepository.findOne = jest.fn().mockResolvedValue(mockSite);

      // Mockowanie isSiteNameUnique, aby zwróciło false
      jest.spyOn(service, 'isSiteNameUnique').mockResolvedValue(false);

      await expect(service.update(uuid, updateSiteDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('powinien rzucić NotFoundException, gdy aktualizacja nie powiedzie się', async () => {
      const uuid = 'test-uuid';
      const updateSiteDto = { name: 'Updated Site Name' };

      // Mockowanie findOne, aby zwróciło istniejącą witrynę
      mockRepository.findOne = jest.fn().mockResolvedValue(mockSite);

      // Mockowanie execute, aby zwróciło 0 affected
      mockRepository.createQueryBuilder().execute = jest
        .fn()
        .mockResolvedValue({ affected: 0 });

      // Mockowanie isSiteNameUnique, aby zwróciło true
      jest.spyOn(service, 'isSiteNameUnique').mockResolvedValue(true);

      await expect(service.update(uuid, updateSiteDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('powinien pomyślnie usunąć witrynę istniejącą o podanym UUID', async () => {
      const uuid = 'test-uuid';

      // Mockowanie findOne, aby zwracało istniejącą witrynę
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockSite);

      const result = await service.remove(uuid);

      // Weryfikacja wywołań metod
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid } });
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('sites');
      expect(repository.createQueryBuilder().delete).toHaveBeenCalled();
      expect(repository.createQueryBuilder().from).toHaveBeenCalledWith(Site);
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
        'sites.uuid = :uuid',
        { uuid },
      );
      expect(result).toEqual({ affected: 1 });
    });

    it('powinien rzucić NotFoundException gdy witryna nie istnieje', async () => {
      const uuid = 'non-existent-uuid';

      // Mockowanie findOne, aby symulować nieistniejącą witrynę
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(uuid)).rejects.toThrow(NotFoundException);
      await expect(service.remove(uuid)).rejects.toThrow(
        `Site with UUID "${uuid}" not found`,
      );
    });

    it('powinien wywołać metodę delete z poprawnym UUID', async () => {
      const uuid = 'test-uuid';

      // Mockowanie findOne, aby zwracało witrynę
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockSite);

      await service.remove(uuid);

      // Sprawdzenie wywołań metod delete
      expect(repository.createQueryBuilder().delete).toHaveBeenCalled();
      expect(repository.createQueryBuilder().from).toHaveBeenCalledWith(Site);
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
        'sites.uuid = :uuid',
        { uuid },
      );
    });
  });

  describe('isSiteNameUnique', () => {
    it('powinien zwrócić true, gdy nazwa witryny jest unikalna', async () => {
      // Mockowanie createQueryBuilder, aby zwracało null (brak istniejącej witryny)
      jest
        .spyOn(repository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(null);

      const result = await service.isSiteNameUnique('NewUniqueSiteName');
      expect(result).toBe(true);
    });

    it('powinien zwrócić false, gdy nazwa witryny już istnieje', async () => {
      // Mockowanie createQueryBuilder, aby zwracało istniejącą witrynę
      jest
        .spyOn(repository.createQueryBuilder(), 'getOne')
        .mockResolvedValueOnce(mockSite);

      const result = await service.isSiteNameUnique('ExistingSiteName');
      expect(result).toBe(false);
    });

    it('powinien wywołać createQueryBuilder z poprawnym zapytaniem', async () => {
      const siteName = 'TestSiteName';

      // Mockowanie createQueryBuilder
      const createQueryBuilderSpy = jest.spyOn(
        repository,
        'createQueryBuilder',
      );

      // Wywołanie metody
      await service.isSiteNameUnique(siteName);

      // Sprawdzenie, czy createQueryBuilder został wywołany z poprawnym argumentem
      expect(createQueryBuilderSpy).toHaveBeenCalledWith('site');

      // Sprawdzenie, czy zostało wywołane zapytanie where z poprawną nazwą
      const whereMethod = repository.createQueryBuilder().where;
      expect(whereMethod).toHaveBeenCalledWith('site.name = :name', {
        name: siteName,
      });
    });
  });
});
