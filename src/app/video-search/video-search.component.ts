import { Component } from '@angular/core';
import { VideoSearchService } from '../core/serachpage/video-search';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { catchError, map, switchMap } from 'rxjs/operators';

interface CaseItem {
  uuid: string;
  caseNumber?: string;
  caseType?: string;
  caseYear?: string;
  itemUrl: string;
  videoUrl?: string | null;
}

@Component({
  selector: 'app-video-search',
  templateUrl: './video-search.component.html',
  styleUrls: ['./video-search.component.scss']
})
export class VideoSearchComponent {

  transcriptControl = new FormControl('');
  private caseListSubject = new BehaviorSubject<CaseItem[]>([]);
  caseList$ = this.caseListSubject.asObservable();
  loading = false;

  constructor(private videoSearchService: VideoSearchService) { }

  onSearchClick() {
    const query = this.transcriptControl.value?.trim();
    if (!query) return;

    this.loading = true;

    this.videoSearchService.searchVideos(query, 10, 0).pipe(
      switchMap(response => {

        const objects =
          response?._embedded?.searchResult?._embedded?.objects ?? [];

        const itemRequests = objects.map((obj: any) => {
          const item = obj?._embedded?.indexableObject;
          const metadata = item?.metadata || {};
          const itemUuid = item?.uuid;

          // Step 1: Get Bundles
          return this.videoSearchService.getItemBundles(itemUuid).pipe(
            switchMap(bundleRes => {
              console.log('📦 Bundles for item', itemUuid, bundleRes);

              const bundles = (bundleRes as any)?._embedded?.bundles ?? [];
              const originalBundle = bundles.find(
                (b: any) => b.name === 'ORIGINAL'
              );

              if (!originalBundle) {
                return of(this.buildCaseItem(item, metadata, null));
              }

              // Step 2: Get Bitstreams of ORIGINAL bundle
              return this.videoSearchService
                .getBundleBitstreams(originalBundle.uuid)
                .pipe(
                  map(bitRes => {
                    const bitstreams =
                      (bitRes as any)?._embedded?.bitstreams ?? [];

                    const firstBitstream = bitstreams[0];

                    const videoUrl = firstBitstream
                      ? `http://localhost:4000/viewer/i/${itemUuid}/f/${firstBitstream.uuid}`
                      : null;

                    return this.buildCaseItem(
                      item,
                      metadata,
                      videoUrl
                    );
                  }),
                  catchError(() =>
                    of(this.buildCaseItem(item, metadata, null))
                  )
                );
            }),
            catchError(() =>
              of(this.buildCaseItem(item, metadata, null))
            )
          );
        });

        if (!itemRequests.length) {
          return of([]); // immediately emit empty array
        }

        return forkJoin(itemRequests);
      }),
      catchError(() => of([]))
    )
      .subscribe((data: CaseItem[]) => {
        this.caseListSubject.next(data);
        this.loading = false;
      });
  }

  private buildCaseItem(item: any, metadata: any, videoUrl: string | null): CaseItem {
    return {
      uuid: item?.uuid,
      caseNumber: this.getMetadata(metadata, 'dc.case.cnrno'),
      caseType: this.getMetadata(metadata, 'dc.casetype'),
      caseYear: this.getMetadata(metadata, 'dc.caseyear'),
      itemUrl: `/items/${item?.uuid}`,
      videoUrl
    };
  }

  private getMetadata(metadata: any, field: string): string | undefined {
    const value = metadata[field];
    return Array.isArray(value) ? value[0]?.value : undefined;
  }
}