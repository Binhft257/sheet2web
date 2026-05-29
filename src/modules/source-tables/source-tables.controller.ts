import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SourceTablesService } from './source-tables.service';
import { CreateSourceTableDto } from './dto/create-source-table.dto';
import { UpdateSourceTableDto } from './dto/update-source-table.dto';

@Controller('source-tables')
export class SourceTablesController {
  constructor(private readonly sourceTablesService: SourceTablesService) {}

  @Post()
  create(@Body() createSourceTableDto: CreateSourceTableDto) {
    return this.sourceTablesService.create(createSourceTableDto);
  }

  @Get()
  findAll() {
    return this.sourceTablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourceTablesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceTableDto: UpdateSourceTableDto) {
    return this.sourceTablesService.update(+id, updateSourceTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceTablesService.remove(+id);
  }
}
