import { Module } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';
import { DataSource } from './entities/data-source.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([DataSource])],
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
})
export class DataSourcesModule {}
