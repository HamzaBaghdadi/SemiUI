import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { RichTextEditorComponent } from '../../../../components/rich-text-editor/rich-text-editor.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComponentDemoComponent } from '../../shared/component-demo/component-demo.component';
import { ComponentPageHeaderComponent } from '../../shared/component-page-header/component-page-header.component';
import { ComponentPageTabsComponent } from '../../shared/component-page-tabs/component-page-tabs.component';
import { ApiEventRow, ApiPropRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { ThemingRow, ThemingTableComponent } from '../../shared/theming-table/theming-table.component';

@Component({
  selector: 'app-rich-text-editor-page',
  imports: [
    RichTextEditorComponent,
    FormsModule,
    FormField,
    ComponentPageHeaderComponent,
    ComponentDemoComponent,
    CodeBlockComponent,
    ComponentPageTabsComponent,
    ApiTableComponent,
    ThemingTableComponent,
  ],
  templateUrl: './rich-text-editor-page.component.html',
  styleUrl: './rich-text-editor-page.component.css',
})
export class RichTextEditorPageComponent {
  protected content = '<p>Building <strong>SemiUI</strong>, an Angular UI library.</p>';

  protected readonly minimalToolbar = ['bold', 'italic', 'underline', 'link'] as const;

  // Signal Forms
  protected readonly noteModel = signal({ body: '<p></p>' });
  protected readonly noteForm = form(this.noteModel);

  protected readonly ngModelCode = `protected content = '<p>Building <strong>SemiUI</strong>, an Angular UI library.</p>';

<s-rich-text-editor [(ngModel)]="content" />`;

  protected readonly minimalCode = `<s-rich-text-editor [toolbar]="['bold', 'italic', 'underline', 'link']" placeholder="Leave a comment..." />`;

  protected readonly signalFormsCode = `protected noteModel = signal({ body: '<p></p>' });
protected noteForm = form(this.noteModel);

<s-rich-text-editor [formField]="noteForm.body" />`;

  protected readonly apiProps: ApiPropRow[] = [
    {
      name: 'value',
      type: 'string',
      default: "''",
      description: 'The editor content as HTML markup. Two-way bindable via ngModel, formControlName, [formField], or [(value)].',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "'Write something...'",
      description: 'Placeholder text shown when the editor is empty.',
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: 'Message rendered via <s-error-message> below the editor while invalid.',
    },
    {
      name: 'toolbar',
      type: 'readonly RichTextEditorTool[]',
      default: 'RICH_TEXT_EDITOR_DEFAULT_TOOLBAR (all tools)',
      description:
        "Which built-in tools show, in order: 'bold' | 'italic' | 'underline' | 'strike' | 'h1' | 'h2' | 'paragraph' | 'ul' | 'ol' | 'align-left' | 'align-center' | 'align-right' | 'link' | 'unlink' | 'undo' | 'redo' | 'clear'.",
    },
    {
      name: 'minHeight',
      type: 'string',
      default: "'10rem'",
      description: "The editable area's minimum height, any CSS length.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables editing. Also set automatically when the bound reactive-forms control is disabled.',
    },
    {
      name: 'fluid',
      type: 'boolean',
      default: 'false',
      description: 'Stretches the editor to fill its container, including inside a flex row.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the editable area once, after its first render.',
    },
  ];

  protected readonly apiEvents: ApiEventRow[] = [
    {
      name: 'touch',
      type: 'EventEmitter<void>',
      description: 'Emitted on blur -- lets Signal Forms mark the field touched.',
    },
  ];

  protected readonly themingDataAttributes: ThemingRow[] = [
    { name: 'data-fluid', description: 'Present on the host when fluid is set -- switches it to full-container width.' },
  ];

  protected readonly themingCssClasses: ThemingRow[] = [
    { name: '.s-rich-text-editor', description: 'The bordered wrapper around the toolbar and content area.' },
    { name: '.s-rich-text-editor__toolbar', description: 'The row of formatting buttons.' },
    { name: '.s-rich-text-editor__tool', description: 'A single toolbar button.' },
    { name: '.s-rich-text-editor__tool--active', description: 'Applied when the format at the current selection/caret is on.' },
    { name: '.s-rich-text-editor__content', description: 'The contenteditable area itself.' },
  ];

  protected readonly themingCssVariables: ThemingRow[] = [
    { name: '--semiui-comp-rich-text-editor-content-heading-font-weight', description: "Weight shared by <h1> and <h2> inside the editable content." },
    { name: '--semiui-comp-input-*', description: "Reused directly -- border, radius, background, typography, and focus/invalid/disabled colors all match Text Input and Textarea." },
    { name: '--semiui-color-primary', description: 'Active-tool highlight color, and link text color inside the content.' },
    { name: '--semiui-color-muted', description: "The toolbar's background." },
    { name: '--semiui-comp-rich-text-editor-tool-background-disabled', description: 'Background of a toolbar button that does not apply to the current selection. Not applied to an active tool, which keeps its highlight.' },
    { name: '--semiui-comp-rich-text-editor-tool-foreground-disabled', description: 'Icon color of that same button.' },
    { name: '--semiui-comp-rich-text-editor-tool-opacity-disabled', description: 'Opacity of a disabled toolbar button. Follows var(--semiui-opacity-disabled); the editable area itself dims with --semiui-comp-input-opacity-disabled.' },
  ];
}
