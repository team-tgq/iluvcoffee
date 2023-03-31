import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

//使用索引快速访问和查询
@Index(['name', 'type'])
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Index()
  @Column()
  name: string;

  @Column('json')
  payload: Record<string, any>; //Record 是一个泛型接口，用于表示一个对象类型，其中键是字符串类型，值可以是任何类型。
}
