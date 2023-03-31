import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class DatabaseModule {
  static register(options: any): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'CONNECTION',
          useValue: options,
        },
      ],
    };
  }
}
