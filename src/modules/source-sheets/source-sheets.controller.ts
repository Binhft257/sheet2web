import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SourceSheetsService } from './source-sheets.service';
import { CreateSourceSheetDto } from './dto/create-source-sheet.dto';
import { UpdateSourceSheetDto } from './dto/update-source-sheet.dto';

@Controller('source-sheets')
export class SourceSheetsController {
  constructor(private readonly sourceSheetsService: SourceSheetsService) {}

  @Post()
  create(@Body() createSourceSheetDto: CreateSourceSheetDto) {
    return this.sourceSheetsService.create(createSourceSheetDto);
  }

  @Get()
  findAll() {
    return this.sourceSheetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourceSheetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceSheetDto: UpdateSourceSheetDto) {
    return this.sourceSheetsService.update(+id, updateSourceSheetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceSheetsService.remove(+id);
  }
}
