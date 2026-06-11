import { Module } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Theme } from './entities/theme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Theme])],
  providers: [ThemesService],
})
export class ThemesModule {}
