import { Component, input, output } from '@angular/core';
import { ButtonDirective } from '@zaytoon/primitives/button';

@Component({
  selector: 'z-button',
  imports: [ButtonDirective],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  disabled = input(false);
  pressed = output<void>();
}
