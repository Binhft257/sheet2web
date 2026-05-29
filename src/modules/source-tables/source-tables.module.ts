import { Module } from '@nestjs/common';
import { SourceTablesService } from './source-tables.service';
import { SourceTablesController } from './source-tables.controller';
import { SourceTable } from './entities/source-table.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([SourceTable])],
  controllers: [SourceTablesController],
  providers: [SourceTablesService],
})
export class SourceTablesModule {}
