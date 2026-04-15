import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Controller('data-sources')
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  create(@Body() createDataSourceDto: CreateDataSourceDto) {
    return this.dataSourcesService.create(createDataSourceDto);
  }

  @Get()
  findAll() {
    return this.dataSourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataSourcesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDataSourceDto: UpdateDataSourceDto) {
    return this.dataSourcesService.update(+id, updateDataSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataSourcesService.remove(+id);
  }
}
