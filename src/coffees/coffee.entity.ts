import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Flavor } from "./entities/flavor.entity/flavor.entity";

@Entity() //sql table=='coffee'
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @JoinTable()
  @ManyToMany(
    type => Flavor,
    flavor => flavor.coffees,
    {
      cascade: true,//级联 新建、更新Coffee中的flavors也会自动更新到数据库Flavor表中
    }
  )
  flavors: Flavor[];
}
