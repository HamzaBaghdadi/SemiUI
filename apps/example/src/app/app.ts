import { Component } from '@angular/core';
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
}
