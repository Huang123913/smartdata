import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { of } from 'rxjs';
import { MCDMService } from '~/services/smartdata/mcdm.service';

@Injectable()
export class JobsListenInterceptor implements NestInterceptor {
  constructor(
    private readonly mcdm: MCDMService,
    private readonly operation: string,
    private readonly nanoidv2: (size?: number) => string,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    if (!this.mcdm.isRewrite()) return next.handle();

    const req = context.switchToHttp().getRequest();
    const result = await this.mcdm.fetch(this.operation, { req });

    const res = context.switchToHttp().getResponse();
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.resId = this.nanoidv2;
    res.send(result);

    return of(null);
  }
}

export function JobsListen(
  operation: string,
  nanoidv2: (size?: number) => string,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor extends JobsListenInterceptor {
    constructor(mcdm: MCDMService) {
      super(mcdm, operation, nanoidv2);
    }
  }

  return Interceptor;
}
