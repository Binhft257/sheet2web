import { PartialType } from '@nestjs/swagger';
import { CreateSyncHistoryDto } from './create-sync-history.dto';

export class UpdateSyncHistoryDto extends PartialType(CreateSyncHistoryDto) {}
