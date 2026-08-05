import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCode,
  lucideFeather,
  lucideLayers,
  lucideMoon,
  lucideSheet,
  lucideStar,
} from '@ng-icons/lucide';
import { ButtonComponent } from '../../components/button/button.component';
import { TagComponent } from '../../components/tag/tag.component';
import { HeroDemoComponent } from './hero-demo/hero-demo.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [ButtonComponent, TagComponent, HeroDemoComponent, NgIcon],
  providers: [
    provideIcons({
      lucideCode,
      lucideSheet,
      lucideMoon,
      lucideStar,
      lucideLayers,
      lucideFeather,
    }),
  ],
})
export class HomeComponent {
  protected readonly router = inject(Router);

  navigateToInstallation() {
    this.router.navigate(['/installation']);
  }

  navigateToComponents() {
    this.router.navigate(['/components']);
  }
}
