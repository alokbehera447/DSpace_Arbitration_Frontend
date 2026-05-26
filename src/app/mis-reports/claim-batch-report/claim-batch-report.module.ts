import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ClaimBatchReportComponent } from './claim-batch-report.component';

const routes: Routes = [
    {
        path: '',
        component: ClaimBatchReportComponent
    }
];

@NgModule({
    declarations: [
        ClaimBatchReportComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class ClaimBatchReportModule { }