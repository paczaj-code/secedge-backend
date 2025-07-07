import { Test, TestingModule } from '@nestjs/testing';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

describe('SeederController', () => {
  let controller: SeederController;
  let seederService: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeederController],
      providers: [
        {
          provide: SeederService,
          useValue: {
            seed: jest.fn().mockResolvedValue('Seeded successfully'),
          },
        },
      ],
    }).compile();

    controller = module.get<SeederController>(SeederController);
    seederService = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call seederService.seed and return its result', async () => {
    const result = await controller.seed();
    expect(seederService.seed).toHaveBeenCalled();
    expect(result).toBe('Seeded successfully');
  });
});
