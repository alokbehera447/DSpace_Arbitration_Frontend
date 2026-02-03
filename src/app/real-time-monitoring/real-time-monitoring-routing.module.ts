import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealTimeMonitoringComponent } from './real-time-monitoring.component';

const routes: Routes = [
  { path: '', component: RealTimeMonitoringComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealTimeMonitoringRoutingModule {}
