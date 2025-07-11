import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../decorators/role.decorator';
import { AuthorizationGuard } from '../../guards/role.quard';
import { UuidValidationPipePipe } from '../../pipes/uuid-validation-pipe/uuid-validation-pipe.pipe';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

export interface AppRequest extends Request {
  user?: {
    uuid: string;
    role: string;
    default_site?: string;
  };
}

@Controller('user')
@Role('TEAM_LEADER')
@UseGuards(AuthorizationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Role('OFFICER')
  @UseGuards(AuthorizationGuard)
  findAll(@Paginate() query: PaginateQuery, @Req() request: AppRequest) {
    return this.userService.findAll(query, request.user);
  }

  @Get(':uuid')
  @Role('OFFICER')
  @UseGuards(AuthorizationGuard)
  findOne(@Param('uuid', new UuidValidationPipePipe()) uuid: string) {
    return this.userService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', new UuidValidationPipePipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(uuid, updateUserDto);
  }

  @Put(':uuid/toggleActive')
  toggleActive(@Param('uuid', new UuidValidationPipePipe()) uuid: string) {
    return this.userService.toggleActive(uuid);
  }

  @Delete(':uuid')
  remove(@Param('uuid', new UuidValidationPipePipe()) uuid: string) {
    return this.userService.remove(uuid);
  }
}
