import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RealTimeMonitoringRoutingModule } from './real-time-monitoring-routing.module';
import { RealTimeMonitoringComponent } from './real-time-monitoring.component';
import { RealTimeMonitoringService } from './real-time-monitoring.service';

@NgModule({
  declarations: [RealTimeMonitoringComponent],
  imports: [
    CommonModule,
    FormsModule,
    RealTimeMonitoringRoutingModule
  ],
  providers: [RealTimeMonitoringService],
})
export class RealTimeMonitoringModule {}


