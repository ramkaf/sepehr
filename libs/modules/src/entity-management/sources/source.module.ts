import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from 'libs/database';
import { SourceService } from './providers/source.service';
import { InsightModule } from '../../insight';

@Module({
  imports: [
    TypeOrmModule.forFeature([Source]),
    forwardRef(() => InsightModule),
  ],
  providers: [SourceService],
  exports: [SourceService],
})
export class SourceModule {}
