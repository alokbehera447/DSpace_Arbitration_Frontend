import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AdvocateNameReportComponent } from './advocate-name-report.component';

const routes: Routes = [{ path: '', component: AdvocateNameReportComponent }];

@NgModule({
    declarations: [AdvocateNameReportComponent],
    imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class AdvocateNameReportModule { }