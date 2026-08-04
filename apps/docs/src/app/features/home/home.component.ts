import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
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
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';
import { PasswordComponent } from '../../components/password/password.component';
import { TagComponent } from '../../components/tag/tag.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    ButtonComponent,
    TagComponent,
    TextInputComponent,
    PasswordComponent,
    CheckboxComponent,
    FormField,
    NgIcon,
  ],
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
  loginModel = signal({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schema) => {
    required(schema.email);
    email(schema.email);

    required(schema.password);
  });

  protected readonly router = inject(Router);

  navigateToInstallation() {
    this.router.navigate(['/installation']);
  }

  navigateToComponents() {
    this.router.navigate(['/components']);
  }
}
