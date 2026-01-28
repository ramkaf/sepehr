import { Module } from '@nestjs/common';
import { SmtpMailerService } from './provider/mailer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { SmtpMailerController } from './controllers/mailer.controller';
import { MailTemplateManagerService } from './provider/mail-template-manager.service';
import { NestConfigModule, NestConfigService } from 'libs/config';

@Module({
  imports: [
    NestConfigModule,
    MailerModule.forRootAsync({
      imports: [NestConfigModule],
      useFactory: async (configService: NestConfigService) => ({
        transport: {
          host: configService.smtpHost, // e.g. mail.sepehrscada.ir
          port: configService.smtpPort, // 587
          secure: false, // TLS/STARTTLS on port 587
          auth: {
            user: configService.smtpUser,
            pass: configService.smtpPassword,
          },
          tls: {
            // 👇 These two lines are important for your case:
            rejectUnauthorized: false, // ignore invalid hostname/cert mismatch
            ciphers: 'SSLv3', // ensure older TLS versions are accepted if needed
          },
        },
        defaults: {
          from: `"No Reply" <${configService.smtpUser}>`,
        },
      }),
      inject: [NestConfigService],
    }),
  ],
  controllers: [SmtpMailerController],
  providers: [SmtpMailerService, MailTemplateManagerService],
  exports: [SmtpMailerService, MailTemplateManagerService],
})
export class SmtpMailerModule {}
