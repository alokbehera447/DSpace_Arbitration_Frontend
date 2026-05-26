import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BatchImportReportComponent } from './batch-import-report.component';

const routes: Routes = [
    {
        path: '',
        component: BatchImportReportComponent
    }
];

@NgModule({
    declarations: [
        BatchImportReportComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class BatchImportReportModule { }