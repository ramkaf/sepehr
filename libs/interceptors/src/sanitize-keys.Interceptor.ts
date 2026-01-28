/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// این عبارت منظم برای شناسایی UUID هاست
const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Injectable()
export class ExcludeSensitiveKeysInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // اگر داده‌ها یک آرایه هستند، برای هر مورد این تابع را اعمال می‌کنیم
        if (Array.isArray(data)) {
          return data.map((item) => this.filterKeys(item));
        }
        return this.filterKeys(data); // اگر داده‌ها یک شیء هستند، همین کار را انجام می‌دهیم
      }),
    );
  }

  // تابع برای حذف id ها از داده‌ها (با رعایت UUID ها)
  private filterKeys(data: any) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        // اگر کلید "id" یا "ForeignKeyId" باشد، آن را حذف می‌کنیم
        if ((key.endsWith('Id') || key === 'id') && !this.isUUID(data[key])) {
          delete data[key];
        }

        // اگر یکی از مقادیر شیء به خودی خود یک شیء است، بازگشتی آن را بررسی می‌کنیم
        if (typeof data[key] === 'object') {
          data[key] = this.filterKeys(data[key]);
        }
      });
    }
    return data;
  }

  // چک کردن اینکه آیا مقدار یک UUID است یا نه
  private isUUID(value: any): boolean {
    return uuidRegex.test(value);
  }
}
