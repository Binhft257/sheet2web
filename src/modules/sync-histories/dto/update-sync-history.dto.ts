import { PartialType } from '@nestjs/mapped-types';
import { CreateSyncHistoryDto } from './create-sync-history.dto';

export class UpdateSyncHistoryDto extends PartialType(CreateSyncHistoryDto) {}
