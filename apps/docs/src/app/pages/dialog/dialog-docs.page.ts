import { Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { DialogComponent } from '../../dialog/dialog.component';
import { DIALOG_DATA, DialogRef, DialogService } from '../../dialog/dialog.service';

interface ConfirmDeleteData {
  itemName: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [ButtonComponent],
  template: `
    <p>Delete "{{ data.itemName }}"? This can't be undone.</p>
    <div class="demo-row" style="justify-content: flex-end; margin-top: 1rem;">
      <z-button [outlined]="true" (click)="dialogRef.close(false)">Cancel</z-button>
      <z-button variant="danger" (click)="dialogRef.close(true)">Delete</z-button>
    </div>
  `,
})
export class ConfirmDeleteDialogContent {
  protected readonly data = inject<ConfirmDeleteData>(DIALOG_DATA);
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
}

@Component({
  selector: 'app-dialog-docs-page',
  imports: [DialogComponent, ButtonComponent],
  templateUrl: './dialog-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class DialogDocsPage {
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
}
