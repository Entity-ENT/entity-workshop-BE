import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, IS_PUBLIC_OR_AUTHENTICATED_KEY } from '../utils/decorators/auth.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class NativeAuthGuard extends AuthGuard('nativeAuth') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.isDecoratorPresent(context, IS_PUBLIC_KEY);
        const isPublicOptional = this.isDecoratorPresent(context, IS_PUBLIC_OR_AUTHENTICATED_KEY);

        if (isPublic) {
            return true;
        }

        if (isPublicOptional) {
            return !!context.switchToHttp().getRequest().headers.authorization ? super.canActivate(context) : true;
        }

        return super.canActivate(context);
    }

    private isDecoratorPresent(context: ExecutionContext, key: string): boolean {
        return this.reflector.getAllAndOverride<boolean>(key, [context.getHandler(), context.getClass()]);
    }
}
