import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPdfPasswordReportComponent } from './user-pdf-password-report.component';

const routes: Routes = [
  {
    path: '',
    component: UserPdfPasswordReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPdfPasswordReportRoutingModule {}
