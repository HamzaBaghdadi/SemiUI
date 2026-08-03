import { Component, DestroyRef, ElementRef, booleanAttribute, inject, input, signal, viewChild } from '@angular/core';
import { ZIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { injectSemiUIIcons } from '@semiui/theme';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export interface FileUploadRejection {
  file: File;
  reason: string;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

/**
 * A drag-and-drop / click-to-browse file picker: selecting or dropping files validates them
 * against `accept`/`maxFileSize`/`maxFiles` and adds the accepted ones to `value` (a `File[]`),
 * showing rejected files with their reason. Only handles selection, validation, and preview --
 * actually uploading the files (however your backend expects them) is up to the consumer, since
 * that's inherently app-specific. Supports ngModel, reactive forms, and Signal Forms through
 * `BaseFormFieldControl`.
 */
@Component({
  selector: 'z-file-upload',
  imports: [ZIconComponent, ErrorMessageComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent extends BaseFormFieldControl<File[]> {
  protected readonly icons = injectSemiUIIcons();
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly previewUrls = new Map<File, string>();

  /** Comma-separated list of MIME types, MIME wildcards (`image/*`), or extensions (`.pdf`). Empty accepts everything. */
  accept = input('');
  multiple = input(true, { transform: booleanAttribute });
  /** Maximum size per file, in bytes. */
  maxFileSize = input<number>();
  /** Maximum number of files that can be selected in total. */
  maxFiles = input<number>();
  errorMessage = input('');

  protected readonly isDragOver = signal(false);
  protected readonly rejections = signal<FileUploadRejection[]>([]);

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => {
      for (const url of this.previewUrls.values()) {
        URL.revokeObjectURL(url);
      }
    });
  }

  protected override emptyValue(): File[] {
    return [];
  }

  protected openFileBrowser(): void {
    if (!this.effectiveDisabled()) {
      this.fileInput()?.nativeElement.click();
    }
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.effectiveDisabled()) {
      this.isDragOver.set(true);
    }
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    this.addFiles(event.dataTransfer?.files ?? null);
  }

  protected removeFile(file: File): void {
    const url = this.previewUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrls.delete(file);
    }
    this.value.update((current) => current.filter((f) => f !== file));
  }

  protected previewUrl(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return null;
    }
    let url = this.previewUrls.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.previewUrls.set(file, url);
    }
    return url;
  }

  protected formatSize(bytes: number): string {
    return formatBytes(bytes);
  }

  private addFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0 || this.effectiveDisabled()) {
      return;
    }
    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: FileUploadRejection[] = [];
    const maxFiles = this.maxFiles();
    const maxSize = this.maxFileSize();
    const startCount = this.value().length;

    for (const file of incoming) {
      if (maxFiles !== undefined && startCount + accepted.length >= maxFiles) {
        rejected.push({ file, reason: `Maximum ${maxFiles} files allowed` });
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({ file, reason: `Exceeds ${formatBytes(maxSize)} limit` });
        continue;
      }
      if (!this.matchesAccept(file)) {
        rejected.push({ file, reason: 'File type not accepted' });
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) {
      this.value.update((current) => (this.multiple() ? [...current, ...accepted] : accepted.slice(0, 1)));
    }
    this.rejections.set(rejected);
    this.handleBlur();
  }

  private matchesAccept(file: File): boolean {
    const accept = this.accept().trim();
    if (!accept) {
      return true;
    }
    const patterns = accept
      .split(',')
      .map((pattern) => pattern.trim().toLowerCase())
      .filter(Boolean);
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return patterns.some((pattern) => {
      if (pattern.startsWith('.')) {
        return name.endsWith(pattern);
      }
      if (pattern.endsWith('/*')) {
        return type.startsWith(pattern.slice(0, -1));
      }
      return type === pattern;
    });
  }
}
