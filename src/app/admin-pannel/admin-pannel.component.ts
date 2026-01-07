import { Component, OnDestroy } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { WatermarkApiService } from './admin-pannel.service';

@Component({
  selector: 'app-admin-pannel',
  templateUrl: './admin-pannel.component.html',
  styleUrls: ['./admin-pannel.component.scss']
})
export class AdminPannelComponent implements OnDestroy {
  imgUrl: string | null = null;
  progress = -1;

  // For drag-and-drop UI
  isDragOver = false;

  constructor(private api: WatermarkApiService) {
    this.refresh();
  }

  ngOnDestroy(): void {
    if (this.imgUrl) {
      URL.revokeObjectURL(this.imgUrl);
      this.imgUrl = null;
    }
  }

  refresh(): void {
    this.api.getCurrent().subscribe({
      next: (blob) => {
        if (this.imgUrl) URL.revokeObjectURL(this.imgUrl);
        this.imgUrl = (!blob || blob.size === 0) ? null : URL.createObjectURL(blob);
      },
      error: () => { this.imgUrl = null; }
    });
  }

  // Handles manual file selection
  onPick(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadFile(file);
  }

  // ✅ DRAG-AND-DROP SUPPORT
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  // ✅ Shared upload logic for both file picker and drag-drop
  private uploadFile(file: File) {
    this.progress = 0;
    this.api.upload(file).subscribe({
      next: (evt: HttpEvent<any>) => {
        if (evt.type === HttpEventType.UploadProgress && evt.total) {
          this.progress = Math.round((evt.loaded / evt.total) * 100);
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.progress = -1;
      },
      complete: () => {
        this.progress = 100;
        this.refresh();
        setTimeout(() => (this.progress = -1), 1200);
      }
    });
  }
}
