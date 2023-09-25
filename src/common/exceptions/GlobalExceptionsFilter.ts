import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

interface Response {
    statusCode: number;
    message: string;
    error?: string;
    path: string;
    timestamp: Date;
    constraints?: Record<string, unknown>;
}

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch<Err extends Error>(exception: Err, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const path = httpAdapter.getRequestUrl(ctx.getRequest());
        const response = this.getResponse(exception, path);

        httpAdapter.reply(ctx.getResponse(), response, response.statusCode);
    }

    private getResponse<Err extends Error>(exception: Err, path: string): Response {
        if (exception instanceof HttpException) {
            if (exception.getStatus() === 500) {
                return this.triggerInternalServerError(exception, path);
            }

            const error = exception.getResponse()['error'];
            const message = GlobalExceptionsFilter.isClassValidationException(exception)
                ? exception.getResponse()['message'][0]
                : exception.message;
            const response: Response = {
                statusCode: exception.getStatus(),
                path,
                error,
                message,
                timestamp: new Date(),
            };
            this.logResponseWithError(path, error, message, exception);
            return response;
        } else if (exception instanceof ValidationError) {
            const error = ValidationError.name;
            const message = "Wrong value for field '" + exception.property + "'";
            const response: Response = {
                statusCode: HttpStatus.BAD_REQUEST,
                path,
                error,
                message,
                timestamp: new Date(),
                constraints: exception.constraints,
            };
            this.logResponseWithError(path, error, message, exception);
            return response;
        }

        return this.triggerInternalServerError(exception, path);
    }

    private triggerInternalServerError<Err extends Error>(exception: Err, path: string): Response {
        const err = exception as Error;
        const response: Response = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal Server Error',
            error: 'InternalServerError',
            path,
            timestamp: new Date(),
        };
        this.logResponseWithError(path, err.name, err.message, err);
        return response;
    }

    private static isClassValidationException<Err extends Error>(exception: Err): boolean {
        return (
            exception instanceof BadRequestException &&
            exception.getResponse() instanceof Object &&
            exception.getResponse()['message'] instanceof Array
        );
    }

    private logResponseWithError(path: string, error: string, message: string, exception: Error) {
        const errorID = uuidv4();
        this.logger.error(`[errorID:${errorID}] ${path} - ${error}: ${message}`, exception.stack);
        this.logger.error(`[errorID:${errorID}] ${path} - details: ${JSON.stringify(error)}`);
    }
}
