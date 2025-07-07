import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'node:path';

describe('SeederService', () => {
  let service: SeederService;

  let mockUserRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    mockUserRepository = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed', () => {
    it('should execute queries from the SQL file', async () => {
      const mockContent = 'INSERT INTO users VALUES (1, "John");';
      jest.spyOn(service, 'readSqlFile').mockReturnValue(mockContent);

      await service.seed();

      expect(mockUserRepository.query).toHaveBeenCalledWith(
        'INSERT INTO users VALUES (1, "John")',
      );
    });
  });

  describe('readSqlFile', () => {
    it('should read and return the content of the specified file', () => {
      const mockFileName = 'test.sql';
      const mockContent = 'SELECT * FROM users;';
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockContent);

      const result = service.readSqlFile(mockFileName);

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join('src', 'seeder', 'sql', mockFileName),
        'utf-8',
      );
      expect(result).toBe(mockContent);
    });

    it('should throw an error if the file cannot be read', () => {
      const mockFileName = 'nonexistent.sql';
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => service.readSqlFile(mockFileName)).toThrowError(
        'File not found',
      );
    });
  });
});
