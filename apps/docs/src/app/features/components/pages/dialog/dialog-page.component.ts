import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { DialogComponent } from '../../../../components/dialog/dialog.component';
import { DIALOG_DATA, DialogRef, DialogService } from '../../../../components/dialog/dialog.service';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

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
}
