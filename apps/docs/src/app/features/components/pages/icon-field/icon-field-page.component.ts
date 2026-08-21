import { Component, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideMail, lucideSearch, lucideUser } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconFieldComponent } from '../../../../components/icon-field/icon-field.component';
import { TextInputComponent } from '../../../../components/text-input/text-input.component';
import { SelectComponent } from '../../../../components/select/select.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-icon-field-page',
  imports: [
    IconFieldComponent,
    TextInputComponent,
    SelectComponent,
    RouterLink,
    FormsModule,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './icon-field-page.component.html',
  styleUrl: './icon-field-page.component.css',
  providers: [provideIcons({ lucideSearch, lucideMail, lucideUser })],
})
export class IconFieldPageComponent {
  protected search = '';
  protected email = '';
  protected username = '';
  protected readonly countries = ['United States', 'Canada', 'Germany', 'France', 'Japan'];
  protected country = '';

  protected readonly leftCode = `<s-icon-field [icon]="{ type: 'ng-icon', name: 'lucideSearch' }">
  <s-text-input [(ngModel)]="search" placeholder="Search" />
</s-icon-field>`;

  protected readonly rightCode = `<s-icon-field [icon]="{ type: 'ng-icon', name: 'lucideMail' }" iconPosition="right">
  <s-text-input [(ngModel)]="email" type="email" placeholder="Email address" />
</s-icon-field>`;

  protected readonly anyFieldCode = `<!-- Works with any SemiUI field, not just Text Input -->
<s-icon-field [icon]="{ type: 'ng-icon', name: 'lucideUser' }">
  <s-select [options]="countries" [(ngModel)]="country" placeholder="Choose a country" />
</s-icon-field>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'icon',
      type: 'IconRef',
      default: 'undefined',
      description: 'The icon to show. Omit to render the wrapper with no icon (padding still applies once set).',
    },
    {
      name: 'iconPosition',
      type: "'left' | 'right'",
      default: "'left'",
      description: "Which side the icon sits on -- the projected field's own padding on that side is reserved for it.",
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-icon-position', description: "The active side, e.g. [data-icon-position='left'] -- drives which side gets the reserved padding." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-icon-field', description: 'The host element itself (this component uses ViewEncapsulation.None, so this class is the real scoping root, not :host).' },
    { name: '.s-icon-field__icon', description: 'The absolutely-positioned icon.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-input-padding-x',
      description: "Reused for both the icon's inset and the reserved padding amount on the projected field -- not a token this component owns.",
    },
  ];
}
