import { PartialType } from '@nestjs/swagger';
import { CreateCellChangeLogDto } from './create-cell-change-log.dto';

export class UpdateCellChangeLogDto extends PartialType(
  CreateCellChangeLogDto,
) {}
