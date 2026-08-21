import { Injectable, TemplateRef, signal } from '@angular/core';
import { ToastVariant } from '@semiui/tokens';

/** Context handed to a custom `template`: the toast entry itself, a bound dismiss callback, and
 * the milliseconds left before auto-dismiss (`null` for sticky toasts, which never count down). */
export interface ToastTemplateContext {
  $implicit: ToastEntry;
  dismiss: () => void;
  remainingMs: number | null;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Set 0 to keep the toast until manually dismissed. */
  duration?: number;
  /** Shows the variant's default icon. Default `true`; set `false` for icon-less toasts. */
  showIcon?: boolean;
  /** Fully replaces this toast's icon/title/description/close-button chrome with a custom template. Context: `{ $implicit: the toast entry, dismiss: () => void, remainingMs: number | null }`. */
  template?: TemplateRef<ToastTemplateContext>;
}

export interface ToastEntry {
  id: number;
  title?: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  showIcon: boolean;
  template?: TemplateRef<ToastTemplateContext>;
}

let nextToastId = 0;

/**
 * Queues toast notifications for `<s-toast-container>` (mounted once, typically in the app root)
 * to render. Injectable anywhere -- call `toastService.success('Saved!')` from any component or
 * service without needing a reference to the container.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastEntry[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(options: ToastOptions): number {
    const id = nextToastId++;
    this._toasts.update((current) => [
      ...current,
      {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'default',
        duration: options.duration ?? 5000,
        showIcon: options.showIcon ?? true,
        template: options.template,
      },
    ]);
    return id;
  }

  success(description: string, title?: string): number {
    return this.show({ description, title, variant: 'success' });
  }

  error(description: string, title?: string): number {
    return this.show({ description, title, variant: 'error' });
  }

  warning(description: string, title?: string): number {
    return this.show({ description, title, variant: 'warning' });
  }

  info(description: string, title?: string): number {
    return this.show({ description, title, variant: 'info' });
  }

  dismiss(id: number): void {
    this._toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
