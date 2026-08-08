import { DOCUMENT, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RtlService {
  private readonly document = inject(DOCUMENT);
  readonly rtl = signal(inject(DOCUMENT).documentElement.dir === 'rtl');

  toggleRtl(): void {
    const root = this.document.documentElement;
    const isRtl = root.dir === 'rtl';
    root.dir = isRtl ? 'ltr' : 'rtl';
    this.rtl.set(root.dir === 'rtl');
  }
}
