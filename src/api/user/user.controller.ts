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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../decorators/role.decorator';
import { AuthorizationGuard } from '../../guards/role.quard';

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
  findAll() {
    return this.userService.findAll();
  }

  @Get(':uuid')
  @Role('OFFICER')
  @UseGuards(AuthorizationGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.userService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(uuid, updateUserDto);
  }

  @Put(':uuid/toggleActive')
  toggleActive(@Param('uuid') uuid: string) {
    return this.userService.toggleActive(uuid);
  }

  @Delete(':uuid')
  remove(@Param('id') uuid: string) {
    return this.userService.remove(uuid);
  }
}
