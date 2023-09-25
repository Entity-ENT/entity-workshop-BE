import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ApiConfigService } from './common/api-config/api.config.service';
import { GlobalExceptionsFilter } from './common/exceptions/GlobalExceptionsFilter';
import * as fs from 'fs';

async function bootstrap() {
    process.on('uncaughtException', function (err) {
        console.log(err);
    });

    const httpsOptions = {
        key: fs.readFileSync('./secrets/localhost-key.pem'),
        cert: fs.readFileSync('./secrets/localhost.pem'),
    };

    const app = await NestFactory.create(AppModule, { httpsOptions });

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new GlobalExceptionsFilter(httpAdapterHost));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    const apiConfigService = app.get<ApiConfigService>(ApiConfigService);
    app.enableCors({
        origin: function (origin, callback) {
            if (
                !origin ||
                apiConfigService.getCorsOriginAccess().indexOf(origin) !== -1 ||
                apiConfigService.getCorsOriginAccess().includes('*')
            ) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,PUT,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    await app.listen(3000, 'localhost');

    Logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
