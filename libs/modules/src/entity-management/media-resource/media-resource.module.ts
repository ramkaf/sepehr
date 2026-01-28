import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaResource } from 'libs/database';
import { MediaResourceService } from './providers/media-resource.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaResource])],
  providers: [MediaResourceService],
  exports: [MediaResourceService],
})
export class MediaResourceModule {}
