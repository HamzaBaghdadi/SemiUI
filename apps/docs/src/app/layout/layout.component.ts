import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterComponent } from './footer/footer.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-layout',
  template: `
    <!-- background/foreground as a pair: every heading and paragraph on the site that doesn't set
         its own color inherits the active preset's foreground from here, so it stays readable in
         dark mode and follows whichever preset is selected. -->
    <div class="flex-1 bg-background text-foreground">
      <app-topbar></app-topbar>
      <ng-content></ng-content>
      <app-footer></app-footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TopbarComponent, FooterComponent],
})
export class LayoutComponent {}
