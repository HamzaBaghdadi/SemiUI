import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { PopoverComponent } from '../../popover/popover.component';

@Component({
  selector: 'app-popover-docs-page',
  imports: [PopoverComponent, ButtonComponent],
  templateUrl: './popover-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class PopoverDocsPage {}
