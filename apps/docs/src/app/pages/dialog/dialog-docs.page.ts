import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-dialog-docs-page',
  imports: [DialogComponent, ButtonComponent],
  templateUrl: './dialog-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class DialogDocsPage {}
