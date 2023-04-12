import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    return next.handle().pipe(map((data) => ({ data })));
    /*{ data }这个对象字面量中只包含一个属性，属性名为data，属性值为在上下文中获取的变量data。
    这个写法等价于{ data: data }，也就是使用对象字面量创建一个对象，其中包含一个名为data的属性，属性的值为变量data。
    */
  }
}
