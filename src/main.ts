import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {PrismaClientExceptionFilter} from "./common/filters/prisma-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ["http://localhost:5173"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });
    app.setGlobalPrefix("api");

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalFilters(new PrismaClientExceptionFilter());
    app.enableCors({
        origin: '*'
    });

    const config = new DocumentBuilder()
        .setTitle("Fast Report API")
        .setDescription("This is a Fast Report API ")
        .setVersion("1.0")
        .addTag("Report App Backend")
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, documentFactory);

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
