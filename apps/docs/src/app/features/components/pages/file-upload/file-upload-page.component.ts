import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../components/button/button.component';
import { FileUploadComponent } from '../../../../components/file-upload/file-upload.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-file-upload-page',
  imports: [
    FileUploadComponent,
    ButtonComponent,
    FormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
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

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'accept',
      type: 'string',
      default: "''",
      description: 'Comma-separated list of MIME types, MIME wildcards (image/*), or extensions (.pdf). Empty accepts everything.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'true',
      description: 'Allows selecting/accumulating more than one file. When false, a new selection replaces the current one.',
    },
    {
      name: 'maxFileSize',
      type: 'number',
      default: 'undefined',
      description: 'Maximum size per file, in bytes. Files over the limit are rejected with a reason.',
    },
    {
      name: 'maxFiles',
      type: 'number',
      default: 'undefined',
      description: 'Maximum number of files that can be selected in total.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Text shown via s-error-message when the control is invalid.',
    },
    {
      name: 'value',
      type: 'File[]',
      default: '[]',
      description: 'The accepted files. Bindable via ngModel, reactive forms, Signal Forms, or plain [(value)].',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the dropzone/browse button and native input.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: 'Marks the control invalid, in addition to any reactive-forms/Signal-Forms invalid state detected automatically.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the dropzone once, after its first render.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur (of the dropzone), so Signal Forms marks the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-file-upload__dropzone', description: 'The drag-and-drop / click-to-browse target.' },
    { name: '.s-file-upload__dropzone[data-drag-over]', description: 'Applied while a drag is over the dropzone.' },
    { name: '.s-file-upload__dropzone[data-disabled]', description: 'Applied when the control is disabled.' },
    { name: '.s-file-upload__list', description: 'The list of currently selected files.' },
    { name: '.s-file-upload__item', description: 'Each selected-file row, with its thumbnail, name, size, and remove button.' },
    { name: '.s-file-upload__thumb--icon', description: 'Fallback generic-file icon shown for non-image files, instead of an image thumbnail.' },
    { name: '.s-file-upload__rejections', description: 'The list of rejected files shown below the dropzone with their reason.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-file-upload-border', description: 'Dropzone border color.' },
    { name: '--semiui-comp-file-upload-background', description: 'Dropzone background.' },
    { name: '--semiui-comp-file-upload-border-drag-over', description: 'Border color while a drag is over the dropzone.' },
    { name: '--semiui-comp-file-upload-background-drag-over', description: 'Background while a drag is over the dropzone.' },
    { name: '--semiui-comp-file-upload-radius', description: 'Dropzone and item corner radius.' },
    { name: '--semiui-comp-file-upload-icon-color', description: 'Color of the upload icon and the generic file-type icon.' },
    { name: '--semiui-comp-file-upload-hint-color', description: 'Color of the "Click to upload or drag and drop" hint text.' },
    { name: '--semiui-comp-file-upload-accept-color', description: 'Color of the accept-pattern hint text.' },
    { name: '--semiui-comp-file-upload-rejection-color', description: 'Color of rejected-file reasons.' },
    { name: '--semiui-comp-file-upload-item-border', description: 'Border color of each selected-file row.' },
    { name: '--semiui-comp-file-upload-item-background', description: 'Background of each selected-file row.' },
    { name: '--semiui-comp-file-upload-thumb-size', description: 'Width/height of each file thumbnail or icon.' },
  ];
}
