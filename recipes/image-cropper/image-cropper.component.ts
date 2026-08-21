import { Component, ElementRef, computed, effect, input, model, output, signal, viewChild } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Pan {
  x: number;
  y: number;
}

/**
 * A pan/zoom image cropper: a fixed crop frame stays put while the image is dragged and zoomed
 * underneath it (the common avatar-upload cropper pattern), rather than a movable/resizable
 * rectangle over a static image. Chosen because it needs no per-handle resize/constraint logic --
 * pan and zoom are the entire interaction surface, clamped so the image always fully covers the
 * frame. `src` is a plain URL/data-URI string; picking a file is left to File Upload or a plain
 * `<input type="file">` elsewhere, read via `FileReader`/`URL.createObjectURL` -- this component
 * only owns the crop interaction, not file selection.
 */
@Component({
  selector: 's-image-cropper',
  imports: [SliderComponent],
  templateUrl: './image-cropper.component.html',
  styleUrl: './image-cropper.component.css',
})
export class ImageCropperComponent {
  private readonly imageEl = viewChild<ElementRef<HTMLImageElement>>('image');

  src = input<string>();
  /** width / height of the crop frame -- 1 (default) is a square. */
  aspectRatio = input(1);
  /** The crop frame's shorter CSS-pixel side; the other side is derived from aspectRatio. */
  viewportSize = input(280);
  minZoom = input(1);
  maxZoom = input(3);
  /** 1 = the image just covers the frame with no room to pan. Two-way bindable. */
  zoom = model(1);
  /** Output canvas size, in px -- defaults to the crop's natural pixel size (no upscale/downscale) when omitted. */
  outputWidth = input<number>();
  outputHeight = input<number>();

  /** Emitted once the image has finished loading and natural dimensions are known. */
  imageLoaded = output<void>();
  /** Emitted with the current crop rectangle (in the image's natural pixel coordinates) whenever pan, zoom, or the image itself changes. */
  cropChange = output<CropRect>();

  protected readonly naturalWidth = signal(0);
  protected readonly naturalHeight = signal(0);
  protected readonly pan = signal<Pan>({ x: 0, y: 0 });
  private isDragging = false;
  private dragStart: Pan = { x: 0, y: 0 };
  private panStart: Pan = { x: 0, y: 0 };

  protected readonly viewportWidth = computed(() => (this.aspectRatio() >= 1 ? this.viewportSize() * this.aspectRatio() : this.viewportSize()));
  protected readonly viewportHeight = computed(() => (this.aspectRatio() >= 1 ? this.viewportSize() : this.viewportSize() / this.aspectRatio()));

  /** "Cover" scale at zoom=1 -- the smallest scale at which the image fully covers the frame with no gaps. */
  private readonly baseScale = computed(() => {
    const nw = this.naturalWidth();
    const nh = this.naturalHeight();
    if (!nw || !nh) {
      return 0;
    }
    return Math.max(this.viewportWidth() / nw, this.viewportHeight() / nh);
  });

  protected readonly scale = computed(() => this.baseScale() * this.zoom());
  protected readonly displayWidth = computed(() => this.naturalWidth() * this.scale());
  protected readonly displayHeight = computed(() => this.naturalHeight() * this.scale());
  protected readonly imageTransform = computed(() => `translate(-50%, -50%) translate(${this.pan().x}px, ${this.pan().y}px)`);

  /** Re-emits the crop rectangle whenever anything it's derived from changes -- reading pan()/
   * scale() here (rather than only inside currentCropRect()) is what gives this effect its
   * tracked dependencies. */
  private readonly emitCropOnChange = effect(() => {
    this.pan();
    this.scale();
    const rect = this.currentCropRect();
    if (rect) {
      this.cropChange.emit(rect);
    }
  });

  protected onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.naturalWidth.set(img.naturalWidth);
    this.naturalHeight.set(img.naturalHeight);
    this.pan.set({ x: 0, y: 0 });
    this.imageLoaded.emit();
  }

  protected onPointerDown(event: PointerEvent): void {
    this.isDragging = true;
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.panStart = this.pan();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    this.setPan({ x: this.panStart.x + dx, y: this.panStart.y + dy });
  }

  protected onPointerUp(): void {
    this.isDragging = false;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.setZoom(this.zoom() + (event.deltaY > 0 ? -0.1 : 0.1));
  }

  protected onZoomInput(value: number): void {
    this.setZoom(value);
  }

  private setZoom(value: number): void {
    this.zoom.set(Math.min(this.maxZoom(), Math.max(this.minZoom(), value)));
    this.setPan(this.pan()); // re-clamp pan against the new scale
  }

  /** Clamps so the image always fully covers the frame -- half the overhang (display size minus
   * frame size) is as far as the image can be panned before a gap would open up on that side. */
  private setPan(next: Pan): void {
    const maxX = Math.max(0, (this.displayWidth() - this.viewportWidth()) / 2);
    const maxY = Math.max(0, (this.displayHeight() - this.viewportHeight()) / 2);
    this.pan.set({
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    });
  }

  private currentCropRect(): CropRect | null {
    const scale = this.scale();
    if (!scale) {
      return null;
    }
    const pan = this.pan();
    const imageLeft = (this.displayWidth() - this.viewportWidth()) / 2 - pan.x;
    const imageTop = (this.displayHeight() - this.viewportHeight()) / 2 - pan.y;
    return {
      x: imageLeft / scale,
      y: imageTop / scale,
      width: this.viewportWidth() / scale,
      height: this.viewportHeight() / scale,
    };
  }

  /** Renders the current crop to a data URL. Null if no image has loaded yet. */
  getCroppedDataUrl(type = 'image/png', quality?: number): string | null {
    return this.renderCropCanvas()?.toDataURL(type, quality) ?? null;
  }

  /** Renders the current crop to a Blob. Resolves null if no image has loaded yet. */
  getCroppedBlob(type = 'image/png', quality?: number): Promise<Blob | null> {
    const canvas = this.renderCropCanvas();
    if (!canvas) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  private renderCropCanvas(): HTMLCanvasElement | null {
    const img = this.imageEl()?.nativeElement;
    const rect = this.currentCropRect();
    if (!img || !rect) {
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = this.outputWidth() ?? Math.round(rect.width);
    canvas.height = this.outputHeight() ?? Math.round(rect.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /** Resets pan/zoom back to the initial (fully-covering, centered) state. */
  reset(): void {
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
  }
}
