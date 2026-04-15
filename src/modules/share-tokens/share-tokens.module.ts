import { Module } from '@nestjs/common';
import { ShareTokensService } from './share-tokens.service';
import { ShareTokensController } from './share-tokens.controller';
import { ShareToken } from './entities/share-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShareToken])],
  controllers: [ShareTokensController],
  providers: [ShareTokensService],
})
export class ShareTokensModule {}
