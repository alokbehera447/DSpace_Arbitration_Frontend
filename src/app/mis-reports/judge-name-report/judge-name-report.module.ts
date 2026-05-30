import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
    RouterModule,
    Routes
} from '@angular/router';

import {
    JudgeNameReportComponent
} from './judge-name-report.component';

const routes: Routes = [
    {
        path: '',
        component: JudgeNameReportComponent
    }
];

@NgModule({
    declarations: [
        JudgeNameReportComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class JudgeNameReportModule { }