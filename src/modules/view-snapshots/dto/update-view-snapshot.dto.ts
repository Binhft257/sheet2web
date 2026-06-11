import { PartialType } from '@nestjs/swagger';
import { CreateViewSnapshotDto } from './create-view-snapshot.dto';

export class UpdateViewSnapshotDto extends PartialType(CreateViewSnapshotDto) {}
