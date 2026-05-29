import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CellChangeLogsService } from './cell-change-logs.service';
import { CreateCellChangeLogDto } from './dto/create-cell-change-log.dto';
import { UpdateCellChangeLogDto } from './dto/update-cell-change-log.dto';

@Controller('cell-change-logs')
export class CellChangeLogsController {
  constructor(private readonly cellChangeLogsService: CellChangeLogsService) {}

  @Post()
  create(@Body() createCellChangeLogDto: CreateCellChangeLogDto) {
    return this.cellChangeLogsService.create(createCellChangeLogDto);
  }

  @Get()
  findAll() {
    return this.cellChangeLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cellChangeLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCellChangeLogDto: UpdateCellChangeLogDto) {
    return this.cellChangeLogsService.update(+id, updateCellChangeLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cellChangeLogsService.remove(+id);
  }
}
