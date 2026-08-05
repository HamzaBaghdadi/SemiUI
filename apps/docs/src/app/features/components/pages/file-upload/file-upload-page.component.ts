import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-file-upload-page',
  imports: [
    FileUploadComponent,
    ButtonComponent,
    FormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './file-upload-page.component.html',
  styleUrl: './file-upload-page.component.css',
})
export class FileUploadPageComponent {
  protected files: File[] = [];
  protected imageFiles: File[] = [];
  protected disabled = signal(false);

  toggleDisabled(): void {
    this.disabled.update((value) => !value);
  }

  protected readonly basicUsageCode = `<s-file-upload [(ngModel)]="files" [multiple]="true" />`;

  protected readonly imagePreviewCode = `<s-file-upload [(ngModel)]="images" accept="image/*" [multiple]="true" />`;

  protected readonly validationCode = `<s-file-upload [(ngModel)]="documents" [maxFiles]="2" [maxFileSize]="1048576" accept=".pdf,.doc,.docx" />
<!-- maxFileSize is in bytes -- 1048576 = 1 MB -->`;

  protected readonly singleFileCode = `<s-file-upload [(ngModel)]="file" [multiple]="false" />`;
}
