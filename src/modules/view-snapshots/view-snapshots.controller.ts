import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ViewSnapshotsService } from './view-snapshots.service';
import { CreateViewSnapshotDto } from './dto/create-view-snapshot.dto';
import { UpdateViewSnapshotDto } from './dto/update-view-snapshot.dto';

@Controller('view-snapshots')
export class ViewSnapshotsController {
  constructor(private readonly viewSnapshotsService: ViewSnapshotsService) {}

  @Post()
  create(@Body() createViewSnapshotDto: CreateViewSnapshotDto) {
    return this.viewSnapshotsService.create(createViewSnapshotDto);
  }

  @Get()
  findAll() {
    return this.viewSnapshotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viewSnapshotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateViewSnapshotDto: UpdateViewSnapshotDto) {
    return this.viewSnapshotsService.update(+id, updateViewSnapshotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewSnapshotsService.remove(+id);
  }
}
