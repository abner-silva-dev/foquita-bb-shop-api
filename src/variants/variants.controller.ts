import { Controller, Get } from '@nestjs/common';
import { Variant } from './schemas/variant.schema';
import { VariantsService } from './variants.service';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  findAll(): Promise<Variant[]> {
    return this.variantsService.findAll();
  }
}
