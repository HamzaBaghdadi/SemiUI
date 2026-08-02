import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../file-upload/file-upload.component';

@Component({
  selector: 'app-file-upload-docs-page',
  imports: [FileUploadComponent, FormsModule],
  templateUrl: './file-upload-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class FileUploadDocsPage {
  protected files: File[] = [];
  protected imageFiles: File[] = [];
  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }
}
