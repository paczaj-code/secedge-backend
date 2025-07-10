import { UuidValidationPipePipe } from './uuid-validation-pipe.pipe';
import { ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { isUUID } from 'class-validator';

jest.mock('class-validator', () => ({
  isUUID: jest.fn(),
}));

describe('UuidValidationPipePipe', () => {
  let pipe: UuidValidationPipePipe;

  beforeEach(() => {
    pipe = new UuidValidationPipePipe();
  });

  it('should return the value if it is a valid UUID', () => {
    (isUUID as jest.Mock).mockReturnValue(true);
    const value = '123e4567-e89b-12d3-a456-426614174000';
    expect(pipe.transform(value, {} as ArgumentMetadata)).toBe(value);
    expect(isUUID).toHaveBeenCalledWith(value);
  });

  it('should throw an exception if the value is not a valid UUID', () => {
    (isUUID as jest.Mock).mockReturnValue(false);
    const value = 'invalid-uuid';
    expect(() => pipe.transform(value, {} as ArgumentMetadata)).toThrow(
      new HttpException(
        'Validation failed: given UUId is invalid',
        HttpStatus.BAD_REQUEST,
      ),
    );
    expect(isUUID).toHaveBeenCalledWith(value);
  });
});
