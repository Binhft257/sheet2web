import { Injectable } from '@nestjs/common';
import { CreateShareTokenDto } from './dto/create-share-token.dto';
import { UpdateShareTokenDto } from './dto/update-share-token.dto';

@Injectable()
export class ShareTokensService {
  create(createShareTokenDto: CreateShareTokenDto) {
    return 'This action adds a new shareToken';
  }

  findAll() {
    return `This action returns all shareTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shareToken`;
  }

  update(id: number, updateShareTokenDto: UpdateShareTokenDto) {
    return `This action updates a #${id} shareToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} shareToken`;
  }
}
