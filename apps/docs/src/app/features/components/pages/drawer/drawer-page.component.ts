import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../components/button/button.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-drawer-page',
  imports: [
    DrawerComponent,
    ButtonComponent,
    RouterLink,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
  ],
  templateUrl: './drawer-page.component.html',
  styleUrl: './drawer-page.component.css',
})
export class DrawerPageComponent {
  protected readonly basicUsageCode = `<s-button (click)="dr.show()">Open drawer</s-button>

<s-drawer #dr title="Edit profile">
  <p>Drawer content</p>
  <ng-template #footer>
    <s-button [outlined]="true" (click)="dr.hide()">Cancel</s-button>
    <s-button (click)="dr.hide()">Save</s-button>
  </ng-template>
</s-drawer>`;

  protected readonly sidesCode = `<s-drawer #dr side="left">...</s-drawer>  <!-- "left" | "right" (default) | "top" | "bottom" | "start" | "end" -->`;

  protected readonly sizesCode = `<s-drawer #dr size="sm">...</s-drawer>  <!-- "sm" | "md" (default) | "lg" | "full" -->`;

  protected readonly headlessCode = `<s-drawer #dr>
  <ng-template #headless>
    <div class="my-custom-drawer">...</div>
  </ng-template>
</s-drawer>`;

  protected readonly backdropCode = `<s-drawer #dr [blurBackdrop]="true">...</s-drawer>
<s-drawer #dr [showBackdrop]="false">...</s-drawer>`;
}
