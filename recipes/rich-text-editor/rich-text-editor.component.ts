import {
  Component,
  ElementRef,
  HostListener,
  afterRenderEffect,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { SIconComponent } from '@semiui/primitives/icon';
import { BaseFormFieldControl } from '@semiui/primitives/form-field';
import { IconRef } from '@semiui/tokens';
import { ErrorMessageComponent } from '../error-message/error-message.component';

export type RichTextEditorTool =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'h1'
  | 'h2'
  | 'paragraph'
  | 'ul'
  | 'ol'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'link'
  | 'unlink'
  | 'undo'
  | 'redo'
  | 'clear';

function svg(inner: string): IconRef {
  return { type: 'svg', markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>` };
}

/** Raw inline SVG rather than the shared IconTokens set (used by injectSemiUIIcons() elsewhere) --
 * bold/italic/underline/etc glyphs aren't part of that interface, and adding them there would mean
 * extending it (and supplying real icons) across all 7 presets for a single component. */
const TOOL_ICONS: Record<RichTextEditorTool, IconRef> = {
  bold: svg('<path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/>'),
  italic: svg('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
  underline: svg('<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/>'),
  strike: svg('<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/>'),
  h1: svg('<text x="2" y="18" font-size="15" font-weight="700" fill="currentColor" stroke="none">H1</text>'),
  h2: svg('<text x="2" y="18" font-size="15" font-weight="700" fill="currentColor" stroke="none">H2</text>'),
  paragraph: svg('<text x="6" y="18" font-size="15" font-weight="700" fill="currentColor" stroke="none">P</text>'),
  ul: svg('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none"/>'),
  ol: svg('<line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8.5" font-size="7" fill="currentColor" stroke="none">1</text><text x="2" y="14.5" font-size="7" fill="currentColor" stroke="none">2</text><text x="2" y="20.5" font-size="7" fill="currentColor" stroke="none">3</text>'),
  link: svg('<path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1 1"/><path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1-1"/>'),
  unlink: svg('<path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1 1"/><path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1-1"/><line x1="3" y1="21" x2="21" y2="3"/>'),
  'align-left': svg('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/>'),
  'align-center': svg('<line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="18" x2="19" y2="18"/>'),
  'align-right': svg('<line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="6" y1="18" x2="20" y2="18"/>'),
  undo: svg('<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 7"/>'),
  redo: svg('<path d="M21 7v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 7"/>'),
  clear: svg('<path d="M4 20h9"/><path d="M17.5 4.5 20 7l-9 9H8l-3-3z"/><path d="m14.5 6.5 3 3"/>'),
};

const TOOL_LABELS: Record<RichTextEditorTool, string> = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strikethrough',
  h1: 'Heading 1',
  h2: 'Heading 2',
  paragraph: 'Paragraph',
  ul: 'Bulleted list',
  ol: 'Numbered list',
  'align-left': 'Align left',
  'align-center': 'Align center',
  'align-right': 'Align right',
  link: 'Insert link',
  unlink: 'Remove link',
  undo: 'Undo',
  redo: 'Redo',
  clear: 'Clear formatting',
};

export const RICH_TEXT_EDITOR_DEFAULT_TOOLBAR: readonly RichTextEditorTool[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'h1',
  'h2',
  'ul',
  'ol',
  'align-left',
  'align-center',
  'align-right',
  'link',
  'unlink',
  'undo',
  'redo',
  'clear',
];

/** Tools with an on/off state `document.queryCommandState` can report -- the rest (h1/h2/
 * paragraph/link/unlink/undo/redo/clear) either aren't stateful or execCommand doesn't expose a
 * matching query, so they're never shown "active". */
const STATEFUL_TOOL_COMMANDS: Partial<Record<RichTextEditorTool, string>> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'strikeThrough',
  ul: 'insertUnorderedList',
  ol: 'insertOrderedList',
  'align-left': 'justifyLeft',
  'align-center': 'justifyCenter',
  'align-right': 'justifyRight',
};

interface ToolbarButton {
  tool: RichTextEditorTool;
  label: string;
  icon: IconRef;
}

/**
 * A `contenteditable`-based WYSIWYG editor: `value` is the HTML markup, same shape a `[(value)]`
 * or reactive-forms/Signal-Forms binding on any other SemiUI field expects. Formatting runs
 * through `document.execCommand` -- deprecated but still universally supported, and the simplest
 * way to get real formatting behavior (undo stack, selection-aware bold/lists/etc) without
 * shipping a third-party editor engine as a dependency of a single recipe. `toolbar` picks which
 * built-in tools show, in order; the actions themselves are fixed, not arbitrary custom commands.
 */
@Component({
  selector: 's-rich-text-editor',
  imports: [SIconComponent, ErrorMessageComponent],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.css',
})
export class RichTextEditorComponent extends BaseFormFieldControl<string> {
  private readonly editorEl = viewChild<ElementRef<HTMLDivElement>>('editor');

  placeholder = input('Write something...');
  errorMessage = input('');
  toolbar = input<readonly RichTextEditorTool[]>(RICH_TEXT_EDITOR_DEFAULT_TOOLBAR);
  minHeight = input('10rem');

  protected readonly toolbarButtons = computed<ToolbarButton[]>(() =>
    this.toolbar().map((tool) => ({ tool, label: TOOL_LABELS[tool], icon: TOOL_ICONS[tool] })),
  );

  protected readonly activeTools = signal<ReadonlySet<RichTextEditorTool>>(new Set());
  /** Flips permanently once the user types -- from then on the div is the source of truth and
   * updates flow the other way (input event -> value.set()). Before that, every external write to
   * `value` (ngModel's initial binding, a later patchValue, etc) is mirrored into the div. Gating
   * on "has the user edited" rather than "has this run once" matters because the CVA's real
   * initial value can arrive *after* this effect's first run (writeValue() isn't necessarily
   * synchronous with the first render) -- a once-only guard would permanently miss it and leave
   * the editor empty. */
  private hasUserEdited = false;

  private readonly syncContent = afterRenderEffect(() => {
    if (this.hasUserEdited) {
      return;
    }
    const el = this.editorEl()?.nativeElement;
    const value = this.value();
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  });

  protected override emptyValue(): string {
    return '';
  }

  focus(options?: FocusOptions): void {
    this.editorEl()?.nativeElement.focus(options);
  }

  protected override focusTarget(): HTMLElement | null {
    return this.editorEl()?.nativeElement ?? null;
  }

  protected onInput(): void {
    this.hasUserEdited = true;
    const el = this.editorEl()?.nativeElement;
    if (el) {
      this.value.set(el.innerHTML);
    }
  }

  protected runCommand(tool: RichTextEditorTool): void {
    const el = this.editorEl()?.nativeElement;
    if (!el || this.effectiveDisabled()) {
      return;
    }
    el.focus();
    switch (tool) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'strike':
        document.execCommand('strikeThrough');
        break;
      case 'h1':
        document.execCommand('formatBlock', false, 'H1');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'H2');
        break;
      case 'paragraph':
        document.execCommand('formatBlock', false, 'P');
        break;
      case 'ul':
        document.execCommand('insertUnorderedList');
        break;
      case 'ol':
        document.execCommand('insertOrderedList');
        break;
      case 'align-left':
        document.execCommand('justifyLeft');
        break;
      case 'align-center':
        document.execCommand('justifyCenter');
        break;
      case 'align-right':
        document.execCommand('justifyRight');
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
      case 'clear':
        document.execCommand('removeFormat');
        break;
      case 'link': {
        // eslint-disable-next-line no-alert
        const url = window.prompt('Link URL');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      }
      case 'unlink':
        document.execCommand('unlink');
        break;
    }
    this.onInput();
    this.refreshActiveTools();
  }

  protected refreshActiveTools(): void {
    const next = new Set<RichTextEditorTool>();
    for (const [tool, command] of Object.entries(STATEFUL_TOOL_COMMANDS) as [RichTextEditorTool, string][]) {
      try {
        if (document.queryCommandState(command)) {
          next.add(tool);
        }
      } catch {
        // queryCommandState can throw for an unsupported command in some browsers -- that tool
        // just never shows as active there.
      }
    }
    this.activeTools.set(next);
  }

  /** Keeps the toolbar's active-state highlighting in sync as the caret moves via arrow keys, not
   * just after running a command -- scoped to selections inside this editor so unrelated page
   * interactions don't trigger a pointless recompute. */
  @HostListener('document:selectionchange')
  protected onSelectionChange(): void {
    const el = this.editorEl()?.nativeElement;
    const selection = document.getSelection();
    if (!el || !selection || selection.rangeCount === 0 || !el.contains(selection.anchorNode)) {
      return;
    }
    this.refreshActiveTools();
  }
}
