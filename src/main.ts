import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ApiConfigService } from './common/api-config/api.config.service';

async function bootstrap() {
    process.on('uncaughtException', function (err) {
        console.log(err);
    });

    const app = await NestFactory.create(AppModule);

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

    await app.listen(3000);

    Logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
