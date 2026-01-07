import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SearchPageComponent } from "./search-page.component";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from '@angular/forms';
import { VideoSearchComponent } from "../video-search/video-search.component";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule
    
  ],
  declarations: [
    SearchPageComponent,
    VideoSearchComponent,
  ],
  exports: [
    SearchPageComponent,
  ],
})
export class SearchPageModule {}
