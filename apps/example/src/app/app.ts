import { Component, signal } from '@angular/core';
import { ButtonVariant, ButtonSize, IconRef } from '@zaytoon/tokens';
import { ButtonComponent } from './button/button.component';

@Component({
  imports: [ButtonComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'example';
  protected clickCount = 0;
  protected variants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'];
  protected sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  protected loading = signal(false);
  protected saveIcon: IconRef = { type: 'ng-icon', name: 'lucideSave' };

  toggleLoading(): void {
    this.loading.update((value) => !value);
  }
}
