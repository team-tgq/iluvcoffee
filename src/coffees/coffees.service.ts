import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { DataSource, Repository } from 'typeorm';
import { Coffee } from './coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity/flavor.entity';
import { Event } from '../events/entities/event.entity/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly FlavorRepository: Repository<Flavor>,
    private dataSource: DataSource, //DataSource 对象注入到一个类,通过该类调用createQueryRunner()方法创建一个事务
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: {
        flavors: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: {
        id: +id,
      },
      relations: ['flavors'], //确定要加载的关系，若不赋值在数据库中无法查询到flavors属性字段
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
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    //提前判断flavors是否为空，为空则不调用map函数
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));
    //如果id存在则修改，不存在则返回undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: {
        id: +id,
      },
    });
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); //建立到数据库的连接
    await queryRunner.startTransaction(); //开启事务
    try {
      //增加Coffee的推荐属性值并创建一个新的推荐咖啡事件通过queryRunner.manager来保持咖啡和事件实体
      coffee.recommendataions++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);
    } catch (err) {
      //捕获错误，通过回滚整个事务来防止数据库中的不一致
      await queryRunner.rollbackTransaction();
    } finally {
      //一切完成后释放queryRunner
      await queryRunner.release();
    }
  }

  //name存在则返回，不存在则新建
  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.FlavorRepository.findOne({
      where: {
        name: name,
      },
    });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.FlavorRepository.create({ name });
  }
}
