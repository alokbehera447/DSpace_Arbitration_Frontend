import { Component } from '@angular/core';
import { VideoSearchService } from '../core/serachpage/video-search';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-video-search',
  templateUrl: './video-search.component.html',
  styleUrls: ['./video-search.component.scss']
})
export class VideoSearchComponent {

  transcriptControl = new FormControl('');   // 👈 REPLACES ngModel
  resultsPerPage = 10;

  private videoListSubject = new BehaviorSubject<any[]>([]);
  videoList$ = this.videoListSubject.asObservable();

  constructor(private videoSearchService: VideoSearchService) {}

  onSearchClick() {
    const query = this.transcriptControl.value || '';

    this.videoSearchService.searchVideos(
      query,
      this.resultsPerPage
    ).subscribe(response => {
      this.loadVideos(response);
    });
  }

  private loadVideos(response: any) {
    const objects = response?._embedded?.searchResult?._embedded?.objects || [];

    const videos = objects.map(obj => {
      const item = obj?._embedded?.indexableObject;
      const metadata = item?.metadata || {};

      return {
        uuid: item?.uuid,
        title: metadata['dc.title']?.[0]?.value || 'Untitled',
        transcript: metadata['dc.transcript']?.[0]?.value || 'No transcript',
        videoUrl:
          metadata['dc.identifier.uri']?.[0]?.value ||
          metadata['dc.video.url']?.[0]?.value ||
          null
      };
    });

    this.videoListSubject.next(videos);
  }
}
