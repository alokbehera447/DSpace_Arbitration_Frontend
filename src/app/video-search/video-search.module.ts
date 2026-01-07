import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { VideoSearchComponent } from './video-search.component';

@NgModule({
  declarations: [
    VideoSearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule   // <-- REQUIRED HERE
  ]
})
export class VideoSearchModule {}
