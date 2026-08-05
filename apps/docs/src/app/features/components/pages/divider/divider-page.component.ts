import { Component } from '@angular/core';
import { DividerComponent } from '../../../../components/divider/divider.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-divider-page',
  imports: [DividerComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './divider-page.component.html',
  styleUrl: './divider-page.component.css',
})
export class DividerPageComponent {
  protected readonly plainCode = `<s-divider />`;
  protected readonly labelCode = `<s-divider>OR</s-divider>`;
  protected readonly verticalCode = `<s-divider orientation="vertical" />`;
}
