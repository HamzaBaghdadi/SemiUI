import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FloatLabelComponent } from '../../../../components/float-label/float-label.component';
import { TextInputComponent } from '../../../../components/text-input/text-input.component';
import { TextareaComponent } from '../../../../components/textarea/textarea.component';
import { SelectComponent } from '../../../../components/select/select.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-float-label-page',
  imports: [
    FloatLabelComponent,
    TextInputComponent,
    TextareaComponent,
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
  templateUrl: './float-label-page.component.html',
  styleUrl: './float-label-page.component.css',
})
export class FloatLabelPageComponent {
  protected overValue = '';
  protected onValue = '';
  protected inValue = '';
  protected selectValue = '';
  protected textareaValue = '';
  protected readonly countries = ['United States', 'Canada', 'Germany', 'France', 'Japan'];

  protected readonly overCode = `<s-float-label label="Email address">
  <s-text-input [(ngModel)]="email" placeholder=" " />
</s-float-label>`;

  protected readonly onCode = `<s-float-label label="Username" variant="on">
  <s-text-input [(ngModel)]="username" placeholder=" " />
</s-float-label>`;

  protected readonly inCode = `<s-float-label label="Full name" variant="in">
  <s-text-input [(ngModel)]="fullName" placeholder=" " />
</s-float-label>`;

  protected readonly anyFieldCode = `<s-float-label label="Choose a country">
  <s-select [options]="countries" [(ngModel)]="country" />
</s-float-label>

<s-float-label label="Bio" variant="in">
  <s-textarea [(ngModel)]="bio" placeholder=" " [rows]="3" />
</s-float-label>`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'label',
      type: 'string',
      default: 'required',
      description: 'The label text.',
    },
    {
      name: 'variant',
      type: "'over' | 'on' | 'in'",
      default: "'over'",
      description: "'over' clears the border entirely (classic Material). 'on' floats to sit on the border line itself. 'in' stays inside the field's own box the whole time, just rising and shrinking (PrimeNG's IftaLabel).",
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-variant', description: "The active variant, e.g. [data-variant='over'] -- drives which floated position/style applies." },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-float-label', description: 'The host element itself (this component uses ViewEncapsulation.None, so this class is the real scoping root, not :host).' },
    { name: '.s-float-label__label', description: 'The floating label element.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-comp-input-*',
      description: 'Reused for the label\'s resting position and font size (padding-x, padding-y, font-size, background, placeholder-foreground) and the "in" variant\'s extra top padding on native-input fields -- not tokens this component owns.',
    },
    {
      name: '--semiui-comp-select-*',
      description: 'Reused the same way for the "in" variant\'s extra top padding on Select/Multiselect triggers.',
    },
    {
      name: '--semiui-color-primary',
      description: 'Floated label color.',
    },
  ];
}
