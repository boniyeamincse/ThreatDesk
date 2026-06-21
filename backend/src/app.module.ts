import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AlertsModule,
    DashboardModule,
    TicketsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
