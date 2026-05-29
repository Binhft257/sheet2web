import { Injectable } from '@nestjs/common';
import { CreateViewSnapshotDto } from './dto/create-view-snapshot.dto';
import { UpdateViewSnapshotDto } from './dto/update-view-snapshot.dto';

@Injectable()
export class ViewSnapshotsService {
  create(createViewSnapshotDto: CreateViewSnapshotDto) {
    return 'This action adds a new viewSnapshot';
  }

  findAll() {
    return `This action returns all viewSnapshots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} viewSnapshot`;
  }

  update(id: number, updateViewSnapshotDto: UpdateViewSnapshotDto) {
    return `This action updates a #${id} viewSnapshot`;
  }

  remove(id: number) {
    return `This action removes a #${id} viewSnapshot`;
  }
}
