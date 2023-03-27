import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RuleTester } from 'eslint';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { Coffee } from './coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity/flavor.entity';

@Injectable()
export class CoffeesService {
  constructor
    (
      @InjectRepository(Coffee)
      private readonly coffeeRepository: Repository<Coffee>,
      @InjectRepository(Flavor)
      private readonly FlavorRepository: Repository<Flavor>,
  ) { }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: ['flavors']
      , skip: offset, take: limit
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: {
        id: +id,
      },
      relations: ['flavors'],
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  /*Promise.all() 方法接收一个 promise的iterable类型的输入，并且只返回一个Promise实例，那个输入的所有 promise 的 resolve 回调的结果是一个数组。
  map() 方法创建一个新数组，这个新数组由原数组中的每个元素都调用一次提供的函数后的返回值组成。map中的name是口味的名字并不是咖啡的名字
  ...为拓展运算符，后面覆盖前面。（自定义的属性在拓展运算符后面，则拓展运算符对象内部同名的属性将被覆盖掉； 自定义的属性在拓展运算度前面，则自定义的属性将被覆盖掉）*/
  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)));
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto, flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    //提前判断flavors是否为空，为空则不调用map函数
    const flavors = updateCoffeeDto.flavors && await Promise.all(updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)));
    //如果id存在则修改，不存在则返回undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return this.coffeeRepository.save(coffee)
  }

  async remove(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: {
        id: +id,
      }
    });
    return this.coffeeRepository.remove(coffee);
  }

  //name存在则返回，不存在则新建
  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.FlavorRepository.findOne({
      where: {
        name: name,
      }
    })
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.FlavorRepository.create({ name })
  }
}
