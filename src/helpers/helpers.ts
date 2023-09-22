import {BadRequestException} from "@nestjs/common";

export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function checkIdLength(id: string | undefined, paramName: string): void {
    if (!id || id?.length !== 24) {
        throw new BadRequestException(paramName + ' wrong format: 24 string length required');
    }
}

