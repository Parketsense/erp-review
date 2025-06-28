import { Module } from '@nestjs/common';
import { AttributeValuesController } from './attribute-values.controller';
import { AttributeValuesService } from './attribute-values.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttributeValuesController],
  providers: [AttributeValuesService],
  exports: [AttributeValuesService],
})
export class AttributeValuesModule {} 