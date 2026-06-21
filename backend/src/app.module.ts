import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { LogSourcesModule } from './modules/log-sources/log-sources.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AlertsModule,
    IncidentsModule,
    DashboardModule,
    TicketsModule,
    IntegrationsModule,
    SettingsModule,
    ReportsModule,
    AuditLogsModule,
    LogSourcesModule,
    NotificationsModule,
    WebsocketModule,
  ],
})
export class AppModule {}
