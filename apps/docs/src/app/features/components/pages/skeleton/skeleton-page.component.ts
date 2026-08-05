import { Component } from '@angular/core';
import { SkeletonComponent } from '../../../../components/skeleton/skeleton.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-skeleton-page',
  imports: [SkeletonComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './skeleton-page.component.html',
  styleUrl: './skeleton-page.component.css',
})
export class SkeletonPageComponent {
  protected readonly shapesCode = `<s-skeleton height="1.25rem" width="60%" />
<s-skeleton shape="circle" width="3rem" height="3rem" />
<s-skeleton shape="text" [lines]="3" />`;

  protected readonly noAnimationCode = `<s-skeleton [animated]="false" />`;
}
