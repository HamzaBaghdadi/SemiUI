import { Component, booleanAttribute, input } from '@angular/core';

/** A bordered box that renders the real, live component being documented. */
@Component({
  selector: 'app-component-demo',
  templateUrl: './component-demo.component.html',
  styleUrl: './component-demo.component.css',
})
export class ComponentDemoComponent {
  /** Stacks content full-width instead of wrapping it in a row -- for demos like Accordion. */
  block = input(false, { transform: booleanAttribute });
}
