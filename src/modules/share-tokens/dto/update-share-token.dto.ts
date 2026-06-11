import { PartialType } from '@nestjs/swagger';
import { CreateShareTokenDto } from './create-share-token.dto';

export class UpdateShareTokenDto extends PartialType(CreateShareTokenDto) {}
