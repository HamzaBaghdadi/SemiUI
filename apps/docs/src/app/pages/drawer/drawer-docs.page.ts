import { Component } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { DrawerComponent } from '../../drawer/drawer.component';

@Component({
  selector: 'app-drawer-docs-page',
  imports: [DrawerComponent, ButtonComponent],
  templateUrl: './drawer-docs.page.html',
  styleUrl: '../docs-page.css',
})
export class DrawerDocsPage {}
