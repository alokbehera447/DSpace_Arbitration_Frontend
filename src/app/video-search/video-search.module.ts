import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { VideoSearchComponent } from './video-search.component';
import { VideoSearchService } from '../core/serachpage/video-search';

@NgModule({
  declarations: [
    VideoSearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    VideoSearchService
  ],
  exports: [
    VideoSearchComponent
  ]
})
export class VideoSearchModule { }