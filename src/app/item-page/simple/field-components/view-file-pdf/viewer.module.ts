import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewerComponent } from './viewer.component';

@NgModule({
  declarations: [ViewerComponent],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ViewFilePdfModule {}
