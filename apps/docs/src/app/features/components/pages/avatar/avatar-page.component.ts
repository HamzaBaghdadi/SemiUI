import { Component } from '@angular/core';
import { AvatarComponent } from '../../../../components/avatar/avatar.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';

@Component({
  selector: 'app-avatar-page',
  imports: [AvatarComponent, ComponentPageHeaderComponent, ComponentDemoComponent, CodeBlockComponent],
  templateUrl: './avatar-page.component.html',
  styleUrl: './avatar-page.component.css',
})
export class AvatarPageComponent {
  protected readonly fallbackCode = `<s-avatar src="https://example.com/photo.jpg" name="Ada Lovelace" />  <!-- image -->
<s-avatar name="Grace Hopper" />  <!-- initials: GH -->
<s-avatar />  <!-- generic icon -->`;

  protected readonly sizesCode = `<s-avatar size="sm" />  <!-- also "md" (default), "lg", "xl" -->`;

  protected readonly shapeCode = `<s-avatar shape="square" />  <!-- default is "circle" -->`;

  protected readonly statusCode = `<s-avatar status="online" />  <!-- also "away", "busy", "offline" -->`;
}
