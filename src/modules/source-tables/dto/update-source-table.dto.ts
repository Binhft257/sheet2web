import { PartialType } from '@nestjs/swagger';
import { CreateSourceTableDto } from './create-source-table.dto';

export class UpdateSourceTableDto extends PartialType(CreateSourceTableDto) {}
