import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class UuidValidationPipePipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (!isUUID(value)) {
      throw new HttpException(
        `Validation failed: given UUId is invalid`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
