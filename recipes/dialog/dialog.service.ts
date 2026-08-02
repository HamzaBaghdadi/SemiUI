import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  Injector,
  Type,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { DialogSize } from '@zaytoon/tokens';
import { DialogComponent } from './dialog.component';

/** Injected into a component opened via `DialogService.open()` to read the `data` passed at open time. */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');

export interface DialogServiceConfig<D = unknown> {
  title?: string;
  size?: DialogSize;
  closable?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  blurBackdrop?: boolean;
  showBackdrop?: boolean;
  /** Passed to the opened component via the `DIALOG_DATA` injection token. */
  data?: D;
}

/** Matches the leave-animation duration in dialog.component.css, so teardown waits for it to finish. */
const CLOSE_ANIMATION_MS = 200;

/**
 * Handle to a dialog opened via `DialogService.open()`. Inject this inside the opened component to
 * close itself and optionally hand a result back to whoever called `open()`.
 */
export class DialogRef<R = unknown> {
  private readonly _closed = signal(false);
  readonly closed = this._closed.asReadonly();
  readonly result: Promise<R | undefined>;
  private resolveResult!: (result: R | undefined) => void;

  /** @internal wired up by DialogService.open() */
  _teardown: ((result: R | undefined) => void) | null = null;

  constructor() {
    this.result = new Promise((resolve) => {
      this.resolveResult = resolve;
    });
  }

  close(result?: R): void {
    if (this._closed()) {
      return;
    }
    this._closed.set(true);
    this.resolveResult(result);
    this._teardown?.(result);
  }
}

/**
 * Opens any component in a modal Dialog imperatively -- PrimeNG DynamicDialog-style, no template
 * markup needed. Dynamically creates a `DialogComponent` shell and projects the given component into
 * its body via `createComponent`'s `projectableNodes`, so the full Dialog chrome (backdrop, focus
 * trap, scroll lock, animations) applies automatically. The opened component can inject `DialogRef`
 * to close itself and `DIALOG_DATA` to read whatever was passed as `config.data`.
 *
 * ```ts
 * const ref = this.dialogService.open(ConfirmComponent, { title: 'Delete item?', data: { id } });
 * ref.result.then((result) => { if (result) { ... } });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly parentInjector = inject(Injector);

  open<T, D = unknown, R = unknown>(component: Type<T>, config: DialogServiceConfig<D> = {}): DialogRef<R> {
    const dialogRef = new DialogRef<R>();

    const contentInjector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: DIALOG_DATA, useValue: config.data },
        { provide: DialogRef, useValue: dialogRef },
      ],
    });

    const contentRef: ComponentRef<T> = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: contentInjector,
    });

    const hostRef: ComponentRef<DialogComponent> = createComponent(DialogComponent, {
      environmentInjector: this.environmentInjector,
      projectableNodes: [[contentRef.location.nativeElement]],
    });

    if (config.title !== undefined) hostRef.setInput('title', config.title);
    if (config.size !== undefined) hostRef.setInput('size', config.size);
    if (config.closable !== undefined) hostRef.setInput('closable', config.closable);
    if (config.closeOnOutsideClick !== undefined) hostRef.setInput('closeOnOutsideClick', config.closeOnOutsideClick);
    if (config.closeOnEscape !== undefined) hostRef.setInput('closeOnEscape', config.closeOnEscape);
    if (config.blurBackdrop !== undefined) hostRef.setInput('blurBackdrop', config.blurBackdrop);
    if (config.showBackdrop !== undefined) hostRef.setInput('showBackdrop', config.showBackdrop);

    this.appRef.attachView(hostRef.hostView);
    this.appRef.attachView(contentRef.hostView);

    let destroyed = false;
    const teardown = (): void => {
      if (destroyed) {
        return;
      }
      destroyed = true;
      hostRef.instance.hide();
      setTimeout(() => {
        this.appRef.detachView(contentRef.hostView);
        this.appRef.detachView(hostRef.hostView);
        contentRef.destroy();
        hostRef.destroy();
      }, CLOSE_ANIMATION_MS);
    };

    dialogRef._teardown = teardown;
    hostRef.instance.closed.subscribe(() => dialogRef.close());

    hostRef.instance.show();

    return dialogRef;
  }
}
