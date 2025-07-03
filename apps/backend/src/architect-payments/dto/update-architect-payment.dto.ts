import { PartialType } from '@nestjs/mapped-types';
import { CreateArchitectPaymentDto } from './create-architect-payment.dto';

export class UpdateArchitectPaymentDto extends PartialType(CreateArchitectPaymentDto) {} 