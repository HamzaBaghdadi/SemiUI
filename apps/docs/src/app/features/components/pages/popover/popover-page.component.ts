import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../components/button/button.component';
import { PopoverComponent } from '../../../../components/popover/popover.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-popover-page',
  imports: [
    PopoverComponent,
    ButtonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './popover-page.component.html',
  styleUrl: './popover-page.component.css',
})
export class PopoverPageComponent {
  protected readonly basicUsageCode = `<s-button (click)="po.toggle($event)">Click to show popover</s-button>

<s-popover #po>
  <span>Popover opened!</span>
</s-popover>`;

  protected readonly separateTriggersCode = `<s-button (click)="po.show($event)">Show</s-button>
<s-button (click)="po.hide()">Hide</s-button>
<s-popover #po placement="right">...</s-popover>`;

  protected readonly appendToCode = `<s-popover #po appendTo="body">...</s-popover>`;
}
