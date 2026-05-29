import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SyncHistoriesService } from './sync-histories.service';
import { CreateSyncHistoryDto } from './dto/create-sync-history.dto';
import { UpdateSyncHistoryDto } from './dto/update-sync-history.dto';

@Controller('sync-histories')
export class SyncHistoriesController {
  constructor(private readonly syncHistoriesService: SyncHistoriesService) {}

  @Post()
  create(@Body() createSyncHistoryDto: CreateSyncHistoryDto) {
    return this.syncHistoriesService.create(createSyncHistoryDto);
  }

  @Get()
  findAll() {
    return this.syncHistoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.syncHistoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSyncHistoryDto: UpdateSyncHistoryDto) {
    return this.syncHistoriesService.update(+id, updateSyncHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.syncHistoriesService.remove(+id);
  }
}
