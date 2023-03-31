import { PartialType } from '@nestjs/mapped-types';
import { CreateCoffeeDto } from '../create-coffee.dto/create-coffee.dto';

//PartialType表示对输入的类中的属性全变为可选并且约束也同时继承
export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {}
