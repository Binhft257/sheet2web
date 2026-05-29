import { PartialType } from '@nestjs/mapped-types';
import { CreateViewSnapshotDto } from './create-view-snapshot.dto';

export class UpdateViewSnapshotDto extends PartialType(CreateViewSnapshotDto) {}
