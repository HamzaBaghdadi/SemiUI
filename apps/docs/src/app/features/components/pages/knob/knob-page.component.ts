import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../../../components/button/button.component';
import { KnobComponent } from '../../../../components/knob/knob.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-knob-page',
  imports: [
    KnobComponent,
    ButtonComponent,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './knob-page.component.html',
  styleUrl: './knob-page.component.css',
})
export class KnobPageComponent {
  protected readonly cpuValue = signal(72);

  protected readonly basicCode = `<s-knob [value]="72" />`;

  protected readonly liveCode = `protected cpuValue = signal(72);

<s-knob [value]="cpuValue()" label="CPU" />`;

  protected readonly dashboardCode = `<s-knob [value]="72" label="CPU" color="#3b82f6" />
<s-knob [value]="41" label="Memory" color="#22c55e" />
<s-knob [value]="93" label="Disk" color="#ef4444" />`;

  protected readonly formatterCode = `<s-knob [value]="4.8" [min]="0" [max]="5" [valueFormatter]="starFormatter" label="Rating" />`;
  protected readonly starFormatter = (value: number): string => value.toFixed(1);

  protected readonly sizeCode = `<s-knob [value]="60" [size]="80" [strokeWidth]="6" />
<s-knob [value]="60" [size]="120" [strokeWidth]="8" />
<s-knob [value]="60" [size]="160" [strokeWidth]="10" />`;

  bump(): void {
    this.cpuValue.set(Math.max(0, Math.min(100, this.cpuValue() + (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random() * 20))));
  }

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'number',
      default: '0',
      description: 'Where the ring fills to, between min and max. Clamped to that range.',
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: 'The value representing an empty ring.',
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: 'The value representing a full ring.',
    },
    {
      name: 'size',
      type: 'number',
      default: '120',
      description: 'Rendered diameter, in pixels.',
    },
    {
      name: 'strokeWidth',
      type: 'number',
      default: '8',
      description: "Ring thickness, in the same 100-unit space size scales to -- roughly proportional to size, not a fixed pixel count.",
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'true',
      description: 'Shows the formatted value (and label, if set) centered inside the ring.',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Small text below the value, e.g. a unit or metric name.',
    },
    {
      name: 'color',
      type: 'string',
      default: 'undefined',
      description: "Overrides the ring's filled-arc color. Defaults to the theme's primary color when omitted.",
    },
    {
      name: 'valueFormatter',
      type: '(value: number) => string',
      default: 'Math.round(value)',
      description: 'Formats the centered value text.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-knob', description: 'The fixed-size wrapper around the SVG ring and centered text.' },
    { name: '.s-knob__track', description: "The ring's background circle." },
    { name: '.s-knob__value', description: "The ring's filled arc, representing value." },
    { name: '.s-knob__center', description: 'Wraps the centered value text and label.' },
    { name: '.s-knob__value-text', description: 'The formatted value.' },
    { name: '.s-knob__label', description: 'The optional label below the value.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    {
      name: '--semiui-color-muted / --semiui-color-primary',
      description: "Reused directly for the track and default arc/value-text color -- same precedent as Progress Bar's own track/fill.",
    },
    { name: '--semiui-comp-knob-value-font-size', description: 'Font size of the centered value text.' },
    { name: '--semiui-comp-knob-label-color', description: "The label's text color." },
    { name: '--semiui-comp-knob-label-font-size', description: "The label's font size." },
  ];
}
