import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BatchRejectReportComponent } from './batch-reject-report.component';

const routes: Routes = [
    {
        path: '',
        component: BatchRejectReportComponent
    }
];

@NgModule({
    declarations: [
        BatchRejectReportComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class BatchRejectReportModule { }