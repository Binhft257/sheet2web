import { Injectable } from '@nestjs/common';
import { CreateSyncHistoryDto } from './dto/create-sync-history.dto';
import { UpdateSyncHistoryDto } from './dto/update-sync-history.dto';

@Injectable()
export class SyncHistoriesService {
  create(createSyncHistoryDto: CreateSyncHistoryDto) {
    return 'This action adds a new syncHistory';
  }

  findAll() {
    return `This action returns all syncHistories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} syncHistory`;
  }

  update(id: number, updateSyncHistoryDto: UpdateSyncHistoryDto) {
    return `This action updates a #${id} syncHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} syncHistory`;
  }
}
