import { Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from '../../entities/site.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site) private readonly siteRepository: Repository<Site>,
  ) {}

  create(createSiteDto: CreateSiteDto) {
    const site = this.siteRepository.create(createSiteDto);
    return this.siteRepository.save(site);
  }

  findAll() {
    return this.siteRepository.createQueryBuilder('site').getMany();
  }

  findOne(uuid: string) {
    return this.siteRepository
      .createQueryBuilder('site')
      .where('site.uuid = :uuid', { uuid })
      .getOne();
  }

  update(uuid: string, updateSiteDto: UpdateSiteDto) {
    return this.siteRepository
      .createQueryBuilder('site')
      .update(Site)
      .set(updateSiteDto)
      .where('site.uuid = :uuid', { uuid })
      .execute();
  }

  remove(uuid: string) {
    return this.siteRepository
      .createQueryBuilder('site')
      .delete()
      .where('site.uuid = :uuid', { uuid })
      .execute();
  }
}
