import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { from } from 'rxjs';
import { MCDMService } from '~/services/smartdata/mcdm.service';

interface InterceptorOptions {
  isSkip?: (req: Request) => boolean;
}

@Injectable()
export class MCDMInterceptor implements NestInterceptor {
  constructor(
    private readonly mcdm: MCDMService,
    private readonly operation: string,
    private readonly options?: InterceptorOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (!this.mcdm.isRewrite()) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    if (this.options?.isSkip?.(req)) return next.handle();

    return from(this.mcdm.fetch(this.operation, { req }));
  }
}

export function MCDMRewrite(
  operation: string,
  options?: InterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor extends MCDMInterceptor {
    constructor(mcdm: MCDMService) {
      super(mcdm, operation, options);
    }
  }

  return Interceptor;
}
