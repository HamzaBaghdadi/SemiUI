import {
  Component,
  ElementRef,
  HostListener,
  afterRenderEffect,
  booleanAttribute,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { IconRef } from '@semiui/tokens';

export interface ContextMenuItem {
  label?: string;
  icon?: IconRef;
  disabled?: boolean;
  /** Renders a plain divider instead of a clickable row -- label/icon/items are ignored. */
  separator?: boolean;
  /** Opens as a submenu on hover, recursively -- any depth. */
  items?: readonly ContextMenuItem[];
}

const VIEWPORT_MARGIN_PX = 8;

/**
 * Renders one level of a context menu's `<ul>`, recursively -- a submenu is just another
 * `ContextMenuPanelComponent`, positioned absolutely off the hovered `<li>` instead of a wrapper
 * div, and flipped to the opposite side (measured after render, same technique Popover's own
 * viewport clamping uses) when it would overflow the right edge. Imports itself via `forwardRef`
 * since a standalone component can't reference its own not-yet-initialized class binding directly
 * in its own `imports` array -- `forwardRef` defers that lookup until it's actually needed.
 */
@Component({
  selector: 's-context-menu-panel',
  imports: [SIconComponent, forwardRef(() => ContextMenuPanelComponent)],
  templateUrl: './context-menu-panel.component.html',
  styleUrl: './context-menu.component.css',
  host: {
    class: 's-context-menu-panel',
    '[attr.data-nested]': 'nested() ? \'\' : null',
    '[class.s-context-menu-panel--flip]': 'flipLeft()',
  },
})
export class ContextMenuPanelComponent {
  private readonly panelRef = viewChild<ElementRef<HTMLUListElement>>('panel');

  items = input<readonly ContextMenuItem[]>([]);
  /** True for every panel except the root -- switches on absolute positioning relative to the
   * parent `<li>` it's anchored inside, instead of flowing naturally in the root overlay. */
  nested = input(false, { transform: booleanAttribute });
  select = output<ContextMenuItem>();

  protected readonly activeIndex = signal<number | null>(null);
  protected readonly flipLeft = signal(false);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly measureFlip = afterRenderEffect(() => {
    if (!this.nested()) {
      return;
    }
    const el = this.panelRef()?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth - VIEWPORT_MARGIN_PX) {
      this.flipLeft.set(true);
    }
  });

  protected hasSubmenu(item: ContextMenuItem): boolean {
    return !!item.items?.length;
  }

  protected onItemEnter(index: number, item: ContextMenuItem): void {
    this.clearCloseTimer();
    this.activeIndex.set(this.hasSubmenu(item) ? index : null);
  }

  protected onItemLeave(): void {
    this.scheduleClose();
  }

  protected onPanelEnter(): void {
    this.clearCloseTimer();
  }

  protected onPanelLeave(): void {
    this.scheduleClose();
  }

  protected selectItem(item: ContextMenuItem): void {
    if (item.disabled || item.separator || this.hasSubmenu(item)) {
      return;
    }
    this.select.emit(item);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  /** A short grace period before a hovered-open submenu closes -- without it, the cursor moving
   * diagonally from the item toward the submenu (crossing empty space) closes the submenu before
   * it's reached. */
  private scheduleClose(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => this.activeIndex.set(null), 200);
  }
}

/**
 * A right-click menu: wrap anything in `<s-context-menu [items]="items">...</s-context-menu>` --
 * right-clicking the wrapped content opens the menu at the cursor instead of the browser's native
 * one. `:host { display: contents }` keeps the wrapped content's own layout undisturbed (see the
 * component's own CSS) -- this component contributes an event listener and a fixed-position
 * overlay, not a box in the wrapped content's flow.
 */
@Component({
  selector: 's-context-menu',
  imports: [ContextMenuPanelComponent],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
  host: {
    class: 's-context-menu',
    '(contextmenu)': 'onContextMenu($event)',
  },
})
export class ContextMenuComponent {
  private readonly panelWrapper = viewChild<ElementRef<HTMLElement>>('panelWrapper');

  items = input<readonly ContextMenuItem[]>([]);
  itemSelected = output<ContextMenuItem>();

  protected readonly open = signal(false);
  protected readonly position = signal({ top: 0, left: 0 });

  private readonly clampPosition = afterRenderEffect(() => {
    if (!this.open()) {
      return;
    }
    const el = this.panelWrapper()?.nativeElement;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const maxLeft = Math.max(VIEWPORT_MARGIN_PX, window.innerWidth - rect.width - VIEWPORT_MARGIN_PX);
    const maxTop = Math.max(VIEWPORT_MARGIN_PX, window.innerHeight - rect.height - VIEWPORT_MARGIN_PX);
    this.position.update((pos) => ({
      left: Math.min(pos.left, maxLeft),
      top: Math.min(pos.top, maxTop),
    }));
  });

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.position.set({ left: event.clientX, top: event.clientY });
    this.open.set(true);
  }

  protected onSelect(item: ContextMenuItem): void {
    this.itemSelected.emit(item);
    this.close();
  }

  protected close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target as Node;
    if (this.panelWrapper()?.nativeElement.contains(target)) {
      return;
    }
    this.close();
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    if (this.open()) {
      this.close();
    }
  }
}
