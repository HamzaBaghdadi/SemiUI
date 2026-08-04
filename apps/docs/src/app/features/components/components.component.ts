import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentsSidebarComponent } from './sidebar/components-sidebar.component';

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: ['./components.component.css'],
  imports: [ComponentsSidebarComponent, RouterOutlet],
})
export class ComponentsComponent {}
