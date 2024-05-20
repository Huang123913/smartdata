import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { from, tap } from 'rxjs';
import { MCDMService } from '~/services/smartdata/mcdm.service';

interface InterceptorOptions {
  isSkip?: (req: Request) => boolean;
}

@Injectable()
export class MCDMJsonInterceptor implements NestInterceptor {
  constructor(
    private readonly mcdm: MCDMService,
    private readonly operation: string,
    private readonly options?: InterceptorOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (!this.mcdm.isRewrite()) return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    if (this.options?.isSkip?.(req)) return next.handle();

    const res = http.getResponse<Response>();
    return from(this.mcdm.fetch(this.operation, { req })).pipe(
      tap((data) => {
        res.json(data);
      }),
    );
  }
}

export function MCDMJsonRewrite(
  operation: string,
  options?: InterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor extends MCDMJsonInterceptor {
    constructor(mcdm: MCDMService) {
      super(mcdm, operation, options);
    }
  }

  return Interceptor;
}
