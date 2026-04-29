import { Module } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';
import { DataSource } from './entities/data-source.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceSheet } from '../source-sheets/entities/source-sheet.entity';
import { GoogleSheetsModule } from '../../google-sheets/google-sheets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataSource, SourceSheet]),
    GoogleSheetsModule,
  ],
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
})
export class DataSourcesModule {}
