import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.roles) {
            return false;
        }

        return this.matchRoles(requiredRoles, user.roles);
    }

    matchRoles(requiredRoles: string[], userRoles: string[]): boolean {
        let foundRole = false;
        for (const role of requiredRoles) {
            if (userRoles.includes(role)) {
                foundRole = true;
                break;
            }
        }

        return foundRole;
    }
}
