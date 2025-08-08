import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Category, Priority, Report, Status, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {

    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

    async runSeed() {
        if(this.configService.get('ENV') !== "dev") {
            return {
                message: 'SEED NOT EXECUTED'
            };
        }
        try {
            await this.cleanDatabase();
            
            const users = await this.createUsers();
            
            const categories = await this.createCategories(users.supervisors);
            
            const reports = await this.createReports(users.students, categories);
            
            await this.createReportPhotos(reports);
            
            await this.createAssignments(reports, users.workers);
            
            await this.createEvidences(reports);
            
            return {
                message: 'SEED EXECUTED SUCCESSFULLY',
                users: users.count,
                categories: categories.length,
                reports: reports.length
            };
        } catch (error) {
            console.error('Error durante la ejecución del seed:', error);
            throw error;
        }
    }

    private async cleanDatabase() {

        await this.prisma.evidenceImage.deleteMany();
        await this.prisma.evidence.deleteMany();
        await this.prisma.asignment.deleteMany();
        await this.prisma.reportImage.deleteMany();
        await this.prisma.report.deleteMany();
        await this.prisma.category.deleteMany();
        await this.prisma.user.deleteMany();
        
        return true;
    }

    private async createUsers() {
        const hashPassword = bcrypt.hashSync('12345678', 10);
        
        const admin = await this.prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'Principal',
                email: 'admin@example.com',
                code: 'ADMIN001',
                password: hashPassword,
                role: 'admin'
            }
        });
        
        const supervisors: User[] = [];
        for (let i = 1; i <= 5; i++) {
            const supervisor = await this.prisma.user.create({
                data: {
                    firstName: `Supervisor${i}`,
                    lastName: `Apellido${i}`,
                    email: `supervisor${i}@example.com`,
                    code: `SUP00${i}`,
                    password: hashPassword,
                    role: 'supervisor'
                }
            });
            supervisors.push(supervisor);
        }
        
        const workers: User[] = [];
        for (let i = 1; i <= 10; i++) {
            const worker = await this.prisma.user.create({
                data: {
                    firstName: `Trabajador${i}`,
                    lastName: `Apellido${i}`,
                    email: `worker${i}@example.com`,
                    code: `WRK00${i}`,
                    password: hashPassword,
                    role: 'worker'
                }
            });
            workers.push(worker);
        }
        
        const students: User[] = [];
        for (let i = 1; i <= 20; i++) {
            const student = await this.prisma.user.create({
                data: {
                    firstName: `Estudiante${i}`,
                    lastName: `Apellido${i}`,
                    email: `student${i}@example.com`,
                    code: `STD00${i}`,
                    password: hashPassword,
                    role: 'student'
                }
            });
            students.push(student);
        }
        
        return {
            admin,
            supervisors,
            workers,
            students,
            count: 1 + supervisors.length + workers.length + students.length
        };
    }

    private async createCategories(supervisors: any[]) {
        const categoryNames = [
            { name: 'Infraestructura', description: 'Problemas relacionados con edificios e instalaciones' },
            { name: 'Servicios Sanitarios', description: 'Problemas con baños y servicios sanitarios' },
            { name: 'Aulas', description: 'Problemas en salones de clase' },
            { name: 'Laboratorios', description: 'Problemas en laboratorios y talleres' },
            { name: 'Áreas Comunes', description: 'Problemas en áreas de uso común' }
        ];
        
        const categories: Category[] = [];
        
        for (let i = 0; i < categoryNames.length; i++) {
            const category = await this.prisma.category.create({
                data: {
                    name: categoryNames[i].name,
                    description: categoryNames[i].description,
                    supervisorId: supervisors[i].id
                }
            });
            categories.push(category);
        }
        
        return categories;
    }

    private async createReports(students: any[], categories: any[]) {
        const reportTitles = [
            'Fuga de agua en baño',
            'Luz fundida en aula',
            'Puerta dañada',
            'Ventana rota',
            'Aire acondicionado no funciona',
            'Falta de mobiliario',
            'Problema con proyector',
            'Computadora no enciende',
            'Filtración en techo',
            'Problema con internet'
        ];
        
        const locations = [
            'Edificio A, Piso 1',
            'Edificio B, Piso 2',
            'Edificio C, Laboratorio 3',
            'Cafetería',
            'Biblioteca',
            'Auditorio',
            'Gimnasio',
            'Estacionamiento',
            'Jardín principal',
            'Sala de conferencias'
        ];
        
        const priorities = ['low', 'medium', 'high'] as Priority[];
        const statuses = ['pending', 'in_progress', 'completed'] as Status[];
        
        const reports: Report[] = [];

        for (let i = 0; i < 30; i++) {
            const randomStudent = students[Math.floor(Math.random() * students.length)];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomTitle = reportTitles[Math.floor(Math.random() * reportTitles.length)];
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            const report = await this.prisma.report.create({
                data: {
                    studentId: randomStudent.id,
                    categoryId: randomCategory.id,
                    title: randomTitle,
                    description: `Descripción detallada del problema: ${randomTitle} en ${randomLocation}. Este problema requiere atención.`,
                    priority: randomPriority,
                    status: randomStatus,
                    location: randomLocation
                }
            });
            
            reports.push(report);
        }
        
        return reports;
    }

    private async createReportPhotos(reports: any[]) {
        const photoUrls = [
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample2.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample3.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample4.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample5.jpg'
        ];
        
        for (const report of reports) {
            const numPhotos = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numPhotos; i++) {
                const randomUrl = photoUrls[Math.floor(Math.random() * photoUrls.length)];
                
                await this.prisma.reportImage.create({
                    data: {
                        reportId: report.id,
                        url: randomUrl
                    }
                });
            }
        }
    }

    private async createAssignments(reports: any[], workers: any[]) {
        const assignableReports = reports.filter(report => 
            report.status === 'in_progress' || report.status === 'completed'
        );
        
        for (const report of assignableReports) {
            const randomWorker = workers[Math.floor(Math.random() * workers.length)];
            
            await this.prisma.asignment.create({
                data: {
                    reportId: report.id,
                    workerId: randomWorker.id
                }
            });
        }
    }

    private async createEvidences(reports: any[]) {
        const completedReports = reports.filter(report => report.status === 'completed');
        
        const evidenceImageUrls = [
            'https://res.cloudinary.com/demo/image/upload/v1312461204/evidence1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/evidence2.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/evidence3.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/evidence4.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1312461204/evidence5.jpg'
        ];
        
        for (const report of completedReports) {
            const evidence = await this.prisma.evidence.create({
                data: {
                    reportId: report.id
                }
            });
            
            const numImages = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numImages; i++) {
                const randomUrl = evidenceImageUrls[Math.floor(Math.random() * evidenceImageUrls.length)];
                
                await this.prisma.evidenceImage.create({
                    data: {
                        evidenceId: evidence.id,
                        url: randomUrl
                    }
                });
            }
        }
    }
}
