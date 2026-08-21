import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { DialogComponent } from '../../../../components/dialog/dialog.component';
import { DIALOG_DATA, DialogRef, DialogService } from '../../../../components/dialog/dialog.service';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

interface ConfirmDeleteData {
  itemName: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [ButtonComponent],
  template: `
    <p>Delete "{{ data.itemName }}"? This can't be undone.</p>
    <div class="flex justify-end gap-3 mt-4">
      <s-button [outlined]="true" (click)="dialogRef.close(false)">Cancel</s-button>
      <s-button variant="danger" (click)="dialogRef.close(true)">Delete</s-button>
    </div>
  `,
})
export class ConfirmDeleteDialogContent {
  protected readonly data = inject<ConfirmDeleteData>(DIALOG_DATA);
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
}

@Component({
  selector: 'app-dialog-page',
  imports: [
    DialogComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './dialog-page.component.html',
  styleUrl: './dialog-page.component.css',
})
export class DialogPageComponent {
  private readonly dialogService = inject(DialogService);
  protected readonly serviceResult = signal<string | null>(null);

  openServiceDialog(): void {
    const ref = this.dialogService.open<ConfirmDeleteDialogContent, ConfirmDeleteData, boolean>(
      ConfirmDeleteDialogContent,
      { title: 'Confirm deletion', data: { itemName: 'Q3 Report.pdf' } },
    );
    ref.result.then((confirmed) => {
      this.serviceResult.set(confirmed ? 'Deleted "Q3 Report.pdf".' : 'Cancelled.');
    });
  }

  protected readonly basicUsageCode = `<s-button (click)="dlg.show()">Open dialog</s-button>

<s-dialog #dlg title="Confirm action">
  <p>Are you sure you want to continue?</p>
  <ng-template #footer>
    <s-button [outlined]="true" (click)="dlg.hide()">Cancel</s-button>
    <s-button (click)="dlg.hide()">Confirm</s-button>
  </ng-template>
</s-dialog>`;

  protected readonly sizesCode = `<s-dialog #dlg size="sm">...</s-dialog>  <!-- "sm" | "md" (default) | "lg" | "full" -->`;

  protected readonly strictCode = `<s-dialog #dlg [closable]="false" [closeOnOutsideClick]="false" [closeOnEscape]="false">...</s-dialog>`;

  protected readonly customHeaderCode = `<s-dialog #dlg>
  <ng-template #header><strong>Custom header</strong></ng-template>
  <p>Body content</p>
</s-dialog>`;

  protected readonly headlessCode = `<s-dialog #dlg>
  <ng-template #headless>
    <div class="my-custom-dialog">...</div>
  </ng-template>
</s-dialog>`;

  protected readonly backdropCode = `<s-dialog #dlg [blurBackdrop]="true">...</s-dialog>
<s-dialog #dlg [showBackdrop]="false">...</s-dialog>`;

  protected readonly serviceCode = `@Component({
  selector: 'app-confirm-delete-dialog',
  template: \`
    <p>Delete "{{ data.itemName }}"?</p>
    <s-button (click)="dialogRef.close(false)">Cancel</s-button>
    <s-button variant="danger" (click)="dialogRef.close(true)">Delete</s-button>
  \`,
})
class ConfirmDeleteDialogContent {
  data = inject<{ itemName: string }>(DIALOG_DATA);
  dialogRef = inject<DialogRef<boolean>>(DialogRef);
}

// elsewhere:
const ref = this.dialogService.open(ConfirmDeleteDialogContent, {
  title: 'Confirm deletion',
  data: { itemName: 'Q3 Report.pdf' },
});
ref.result.then((confirmed) => { ... });`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'title',
      type: 'string',
      default: "''",
      description: 'Plain text title shown in the header. Ignored when the #header template is projected.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'full'",
      default: "'md'",
      description: 'Controls the panel max-width (and, for full, height too) via the size-scoped tokens.',
    },
    {
      name: 'closable',
      type: 'boolean',
      default: 'true',
      description: 'Shows the "x" close button in the header.',
    },
    {
      name: 'closeOnOutsideClick',
      type: 'boolean',
      default: 'true',
      description: 'Clicking the backdrop closes the dialog.',
    },
    {
      name: 'closeOnEscape',
      type: 'boolean',
      default: 'true',
      description: 'Pressing Escape closes the dialog.',
    },
    {
      name: 'blurBackdrop',
      type: 'boolean',
      default: 'false',
      description: 'Blurs whatever is behind the backdrop, in addition to dimming it.',
    },
    {
      name: 'showBackdrop',
      type: 'boolean',
      default: 'true',
      description: "Hides the dimming/blur backdrop entirely -- the panel still portals, traps focus, and locks scroll, it just doesn't visually cover the page behind it.",
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'closed',
      type: 'EventEmitter<void>',
      description: 'Fires whenever the dialog closes, regardless of trigger (close button, outside click, escape, or hide()).',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-dialog__backdrop', description: 'The fixed, full-viewport dimming layer behind the panel.' },
    { name: '.s-dialog__panel', description: 'The dialog box itself: background, border, shadow, and max-width per size.' },
    { name: '.s-dialog__header', description: 'Wraps the title (or #header template) and close button.' },
    { name: '.s-dialog__title', description: 'The plain-text title element.' },
    { name: '.s-dialog__close', description: 'The "x" close button.' },
    { name: '.s-dialog__body', description: 'The scrollable content area, projecting default (non-headless) content.' },
    { name: '.s-dialog__footer', description: 'Wraps the #footer template, if projected.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-dialog-backdrop-color', description: 'Backdrop dimming color.' },
    { name: '--semiui-comp-dialog-widths-{sm,md,lg,full}', description: 'Panel max-width per size.' },
    { name: '--semiui-comp-dialog-panel-background', description: 'Panel background color.' },
    { name: '--semiui-comp-dialog-panel-border', description: 'Panel border color.' },
    { name: '--semiui-comp-dialog-radius', description: 'Panel corner radius.' },
    { name: '--semiui-comp-dialog-shadow', description: 'Panel box shadow.' },
    { name: '--semiui-comp-dialog-padding', description: 'Padding shared by the header, body, and footer.' },
    { name: '--semiui-comp-dialog-header-border', description: 'Border between the header and body.' },
    { name: '--semiui-comp-dialog-footer-border', description: 'Border between the body and footer.' },
    { name: '--semiui-comp-dialog-title-font-size', description: 'Title font size.' },
    { name: '--semiui-comp-dialog-title-font-weight', description: 'Title font weight.' },
  ];
}
