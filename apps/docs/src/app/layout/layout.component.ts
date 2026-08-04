import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterComponent } from './footer/footer.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-layout',
  template: `
    <div class="flex-1   bg-background">
      <app-topbar></app-topbar>
      <ng-content></ng-content>
      <app-footer></app-footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TopbarComponent, FooterComponent],
})
export class LayoutComponent {}
