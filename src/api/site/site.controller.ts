import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Role } from '../../decorators/role.decorator';
import { AuthorizationGuard } from '../../guards/role.quard';

@Controller('site')
@Role('TEAM_LEADER')
@UseGuards(AuthorizationGuard)
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(createSiteDto);
  }

  @Get()
  @Role('OFFICER')
  @UseGuards(AuthorizationGuard)
  findAll() {
    return this.siteService.findAll();
  }

  @Get(':uuid')
  @Role('OFFICER')
  @UseGuards(AuthorizationGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.siteService.findOne(uuid);
  }

  @Put(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateSiteDto: UpdateSiteDto) {
    console.log(updateSiteDto);
    return this.siteService.update(uuid, updateSiteDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.siteService.remove(uuid);
  }
}
