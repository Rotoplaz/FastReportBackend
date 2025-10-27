import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {PrismaClientExceptionFilter} from "./common/filters/prisma-exception.filter";

// TODO: Aplicar patrones para mejorar el código (Repository, Domain Services / Use Cases, CQRS).
// TODO: Quitar o redefinir la relación de las asignaciones (reporte -> asignaciones -> muchos trabajadores).
// TODO: Mover la lógica de trabajadores fuera del módulo de usuarios.
// TODO: Configurar n8n para manejar embeddings y mejorar la respuesta del chatbot.


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
