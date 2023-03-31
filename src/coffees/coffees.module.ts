import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './coffee.entity';
import { COFFEE_BRANDS, COFFEE_BRANDS_FACTORY } from './coffees.contants';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Flavor } from './entities/flavor.entity/flavor.entity';

class ConfigSercive {}
class DevelopmentConfigService {}
class ProductionConfigService {}
@Injectable()
export class CoffeeBrandsFactory {
  create() {
    return ['buddy brew-f', 'nescafe-f'];
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController], //controller本身也是Provider
  providers: [
    CoffeesService,
    CoffeeBrandsFactory,
    {
      provide: ConfigSercive,
      useClass:
        process.env.Node_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService,
    },
    {
      provide: COFFEE_BRANDS,
      useValue: ['buddy brew', 'nescafe'],
    },
    {
      provide: COFFEE_BRANDS_FACTORY,
      useFactory: (brandsfactory: CoffeeBrandsFactory) =>
        brandsfactory.create(),
      inject: [CoffeeBrandsFactory],
    },
  ], //注册provider
  exports: [CoffeesService],
})
export class CoffeesModule {}
