import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
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
    // Check if the site name is unique before creating a new site
    if (!createSiteDto.name) {
      throw new HttpException('Site name is required', 400);
    }
    const isUnique = this.isSiteNameUnique(createSiteDto.name);
    if (!isUnique) {
      throw new HttpException(
        `Site name "${createSiteDto.name}" already exists`,
        400,
      );
    }
    const site = this.siteRepository.create(createSiteDto);
    return this.siteRepository.save(site);
  }

  findAll() {
    return this.siteRepository.createQueryBuilder('site').getMany();
  }

  async findOne(uuid: string) {
    const site = await this.siteRepository
      .createQueryBuilder('site')
      .where('site.uuid = :uuid', { uuid })
      .getOne();

    if (!site) {
      throw new NotFoundException(`Site with UUID "${uuid}" not found`);
    }

    return site;
  }

  async update(uuid: string, updateSiteDto: UpdateSiteDto) {
    const site = await this.findOne(uuid);

    if (!site) {
      throw new NotFoundException(`Site with UUID "${uuid}" not found`);
    }

    // Check if the site name is unique if it is being updated
    if (updateSiteDto.name && updateSiteDto.name !== site.name) {
      const isUnique = await this.isSiteNameUnique(updateSiteDto.name);
      if (!isUnique) {
        throw new HttpException(
          `Site name "${updateSiteDto.name}" already exists`,
          400,
        );
      }
    }
    const result = await this.siteRepository
      .createQueryBuilder('sites')
      .update(Site)
      .set(updateSiteDto)
      .where('sites.uuid = :uuid', { uuid })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        `Site with UUID "${uuid}" could not be updated`,
      );
    }

    return result;
  }

  async remove(uuid: string) {
    // TODO Change if the site has any associated resources before deletion
    // This could include checking for associated users, projects, etc.
    // If there are associated resources, throw an error or handle accordingly
    // For now, we will just delete the site without checking for associated resources
    const site = await this.findOne(uuid);
    if (!site) {
      throw new NotFoundException(`Site with UUID "${uuid}" not found`);
    }

    return await this.siteRepository
      .createQueryBuilder('sites')
      .delete()
      .from(Site)
      .where('sites.uuid = :uuid', { uuid })
      .execute();
  }

  async isSiteNameUnique(name: string): Promise<boolean> {
    const existingSite = await this.siteRepository
      .createQueryBuilder('site')
      .where('site.name = :name', { name })
      .getOne();

    return !existingSite;
  }
}
