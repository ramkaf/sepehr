import { Module } from '@nestjs/common';
import { BrowserModule } from './browser/browser.module';

@Module({
  imports: [BrowserModule],
})
export class DashboardModule {}
