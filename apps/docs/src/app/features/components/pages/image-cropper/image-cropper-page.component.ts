import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ImageCropperComponent } from '../../../../components/image-cropper/image-cropper.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

/** A generated placeholder (a gradient + label) so the live demo below has something to crop
 * without depending on an external image URL. */
function buildPlaceholderImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 900, 600);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#ec4899');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 900, 600);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Sample image', 450, 300);
  return canvas.toDataURL('image/png');
}

@Component({
  selector: 'app-image-cropper-page',
  imports: [
    ImageCropperComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './image-cropper-page.component.html',
  styleUrl: './image-cropper-page.component.css',
})
export class ImageCropperPageComponent {
  private readonly cropper = viewChild<ImageCropperComponent>('cropper');
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly imageSrc = signal(buildPlaceholderImage());
  protected readonly croppedPreview = signal<string | null>(null);

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.imageSrc.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected pickFile(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected cropImage(): void {
    this.croppedPreview.set(this.cropper()?.getCroppedDataUrl() ?? null);
  }

  protected resetCropper(): void {
    this.cropper()?.reset();
    this.croppedPreview.set(null);
  }

  protected readonly basicCode = `<s-image-cropper #cropper [src]="imageSrc" [aspectRatio]="1" />
<button (click)="preview = cropper.getCroppedDataUrl()">Crop</button>`;

  protected readonly wideCode = `<s-image-cropper [src]="imageSrc" [aspectRatio]="16/9" [viewportSize]="200" />`;

  protected readonly apiProps: ApiPropRow[] = [
    { name: 'src', type: 'string', default: 'undefined', description: 'The image URL or data URI to crop.' },
    { name: 'aspectRatio', type: 'number', default: '1', description: 'width / height of the crop frame -- 1 is a square, 16/9 widescreen, etc.' },
    { name: 'viewportSize', type: 'number', default: '280', description: "The crop frame's shorter CSS-pixel side; the other side is derived from aspectRatio." },
    { name: 'zoom', type: 'number', default: '1', description: '1 = the image just covers the frame with no room to pan. Two-way bindable.' },
    { name: 'minZoom', type: 'number', default: '1', description: 'Minimum zoom.' },
    { name: 'maxZoom', type: 'number', default: '3', description: 'Maximum zoom.' },
    { name: 'outputWidth', type: 'number | undefined', default: 'undefined', description: "Output canvas width -- defaults to the crop's natural pixel size (no upscale/downscale)." },
    { name: 'outputHeight', type: 'number | undefined', default: 'undefined', description: "Output canvas height -- defaults to the crop's natural pixel size." },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    { name: 'imageLoaded', type: 'EventEmitter<void>', description: "Emitted once the image has finished loading and natural dimensions are known." },
    { name: 'cropChange', type: 'EventEmitter<CropRect>', description: 'Emitted with the current crop rectangle (natural image pixel coordinates) whenever pan, zoom, or the image changes.' },
  ];

  protected readonly apiMethods: ApiPropRow[] = [
    { name: 'getCroppedDataUrl(type?, quality?)', type: '(type?: string, quality?: number) => string | null', default: '', description: "Renders the current crop to a data URL. Null if no image has loaded yet." },
    { name: 'getCroppedBlob(type?, quality?)', type: '(type?: string, quality?: number) => Promise<Blob | null>', default: '', description: 'Renders the current crop to a Blob.' },
    { name: 'reset()', type: '() => void', default: '', description: 'Resets pan/zoom back to the initial (fully-covering, centered) state.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-image-cropper__viewport', description: 'The fixed crop frame -- clips the image and captures pointer/wheel input.' },
    { name: '.s-image-cropper__image', description: 'The dragged/zoomed <img> itself.' },
    { name: '.s-image-cropper__grid-line', description: 'One of the four rule-of-thirds guide lines.' },
    { name: '.s-image-cropper__zoom', description: "The zoom control -- SemiUI's own <s-slider>, not a native range input. Styled through Slider's own theming, not this component's." },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-table-border', description: "The frame's border color." },
    { name: '--semiui-color-muted', description: "The frame's background, visible while the image is loading." },
    { name: '--semiui-radius-md', description: "The frame's corner radius." },
    { name: '--semiui-comp-image-cropper-zoom-slider-max-width', description: "The zoom slider's max-width." },
  ];
}
