import { Component, DestroyRef, ElementRef, HostListener, WritableSignal, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { AvatarComponent } from '../../../components/avatar/avatar.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { CheckboxComponent } from '../../../components/checkbox/checkbox.component';
import { DatePickerComponent } from '../../../components/date-picker/date-picker.component';
import { OtpComponent } from '../../../components/otp/otp.component';
import { PasswordComponent } from '../../../components/password/password.component';
import { RatingComponent } from '../../../components/rating/rating.component';
import { SelectComponent } from '../../../components/select/select.component';
import { SliderComponent } from '../../../components/slider/slider.component';
import { StepItem, StepperComponent } from '../../../components/stepper/stepper.component';
import { SwitchComponent } from '../../../components/switch/switch.component';
import { TextInputComponent } from '../../../components/text-input/text-input.component';

type DemoScene = 'login' | 'booking' | 'settings' | 'feedback';

interface PlanOption {
  label: string;
  value: string;
}

const TYPE_MS_PER_CHAR = 130;
/** How long a freshly-swapped-in scene sits idle before the script starts touching it -- gives the enter transition room to finish. */
const SCENE_ENTER_MS = 700;
/** How long a completed step (filled form, picked date, toggled switch...) stays on screen before the demo moves on -- long enough to actually read it. */
const HOLD_MS = 2200;
/** How close the cursor needs to be to the card's own box, in px, before the border glow starts fading in. */
const GLOW_PROXIMITY_PX = 140;

/**
 * The hero section's auto-playing showcase: cycles forever through four scenes -- a Signal Forms
 * login, a Select + Date Picker "booking" card, a Switch + Slider + Stepper settings card, and a
 * Rating + Avatar + OTP feedback card -- typing, clicking, and toggling the real components itself
 * instead of sitting there as a static, fill-it-in-yourself form nobody visiting actually would.
 * Deliberately not every component in the library -- just enough variety to show the range without
 * turning the hero section into the full component gallery. Lives in its own component purely to
 * keep this choreography (and its ViewChild plumbing) out of HomeComponent.
 */
@Component({
  selector: 'app-hero-demo',
  imports: [
    ButtonComponent,
    TextInputComponent,
    PasswordComponent,
    CheckboxComponent,
    SelectComponent,
    DatePickerComponent,
    SwitchComponent,
    SliderComponent,
    AvatarComponent,
    RatingComponent,
    OtpComponent,
    StepperComponent,
    FormField,
  ],
  templateUrl: './hero-demo.component.html',
  styleUrl: './hero-demo.component.css',
})
export class HeroDemoComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private stopped = false;

  protected readonly activeScene = signal<DemoScene>('login');
  protected readonly sceneLabel = computed(() => {
    switch (this.activeScene()) {
      case 'login':
        return 'Login Form';
      case 'booking':
        return 'Select & Date Picker';
      case 'settings':
        return 'Switch, Slider & Stepper';
      case 'feedback':
        return 'Rating, Avatar & OTP';
    }
  });

  /** Border-glow position, as a percentage of the card's own box (can go outside 0-100 while the
   * cursor is near but not actually over the card -- the radial-gradient center just extrapolates
   * off-box, which is exactly the "leaning toward the cursor" look this is going for). */
  protected readonly glowX = signal(50);
  protected readonly glowY = signal(50);
  /** 0-1, fading out smoothly as the cursor moves from right on the card's edge out to GLOW_PROXIMITY_PX away, instead of a hard on/off switch. */
  protected readonly glowOpacity = signal(0);

  // Scene 1: login
  loginModel = signal({
    email: '',
    password: '',
  });
  loginForm = form(this.loginModel, (schema) => {
    required(schema.email);
    email(schema.email);

    required(schema.password);
  });
  protected readonly signInPressed = signal(false);

  // Scene 2: booking (Select + Date Picker)
  protected readonly plans: readonly PlanOption[] = [
    { label: 'Starter', value: 'starter' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];
  protected readonly planValue = signal<string | null>(null);
  protected readonly bookingDate = signal<Date | null>(null);
  private readonly planSelectHost = viewChild<unknown, ElementRef<HTMLElement>>('planSelect', { read: ElementRef });
  private readonly dateFieldHost = viewChild<unknown, ElementRef<HTMLElement>>('dateField', { read: ElementRef });

  // Scene 3: settings (Switch + Slider + Stepper)
  protected readonly notifications = signal(false);
  protected readonly volume = signal(0);
  protected readonly percentFormatter = (value: number): string => `${value}%`;
  protected readonly stepItems: readonly StepItem[] = [{ label: 'Account' }, { label: 'Profile' }, { label: 'Payment' }];
  protected readonly stepIndex = signal(0);

  // Scene 4: feedback (Rating + Avatar + OTP)
  protected readonly ratingValue = signal<number | null>(null);
  private readonly ratingHost = viewChild<unknown, ElementRef<HTMLElement>>('ratingStars', { read: ElementRef });
  protected readonly otpValue = signal('');

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.stopped = true;
    });
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      void this.runLoop();
    });
  }

  /** Tracked on the window, not just the card -- "near it" has to include the cursor being just
   * outside the box, which a plain (mousemove) on the card itself would never see. */
  @HostListener('window:mousemove', ['$event'])
  protected onWindowMouseMove(event: MouseEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
    const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance > GLOW_PROXIMITY_PX) {
      this.glowOpacity.set(0);
      return;
    }
    this.glowX.set(((event.clientX - rect.left) / rect.width) * 100);
    this.glowY.set(((event.clientY - rect.top) / rect.height) * 100);
    this.glowOpacity.set(1 - distance / GLOW_PROXIMITY_PX);
  }

  private async runLoop(): Promise<void> {
    while (!this.stopped) {
      await this.runLoginScene();
      if (this.stopped) return;
      await this.runBookingScene();
      if (this.stopped) return;
      await this.runSettingsScene();
      if (this.stopped) return;
      await this.runFeedbackScene();
    }
  }

  private async runLoginScene(): Promise<void> {
    this.activeScene.set('login');
    this.loginForm.email().reset('');
    this.loginForm.password().reset('');
    await this.wait(SCENE_ENTER_MS);
    if (this.stopped) return;

    await this.typeInto((text) => this.loginForm.email().value.set(text), 'ada@lovelace.dev');
    if (this.stopped) return;
    await this.wait(450);
    if (this.stopped) return;

    await this.typeInto((text) => this.loginForm.password().value.set(text), 'hunter22');
    if (this.stopped) return;
    await this.wait(HOLD_MS);
    if (this.stopped) return;

    // Credentials are in -- press Sign In and move straight on, no deliberate error demonstration.
    this.signInPressed.set(true);
    await this.wait(220);
    this.signInPressed.set(false);
    await this.wait(HOLD_MS);
  }

  private async runBookingScene(): Promise<void> {
    this.activeScene.set('booking');
    this.planValue.set(null);
    this.bookingDate.set(null);
    await this.wait(SCENE_ENTER_MS);
    if (this.stopped) return;

    // Real clicks on the real trigger/option elements -- not just setting the bound value -- so
    // the actual open/select animations play, the same as a visitor clicking them would see.
    const selectHost = this.planSelectHost()?.nativeElement;
    selectHost?.querySelector<HTMLElement>('[role="combobox"]')?.click();
    await this.wait(900);
    if (this.stopped) return;
    selectHost?.querySelectorAll<HTMLElement>('[role="option"]')[1]?.click();
    await this.wait(HOLD_MS);
    if (this.stopped) return;

    const dateHost = this.dateFieldHost()?.nativeElement;
    dateHost?.querySelector<HTMLElement>('[role="combobox"]')?.click();
    await this.wait(900);
    if (this.stopped) return;
    // The panel opens on the current month with no navigation -- the 12th is guaranteed to exist
    // and be visible there regardless of what day of the month it actually is today, unlike an
    // offset like "+10 days" which can land in next month and never be on screen at all.
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-12`;
    dateHost?.querySelector<HTMLElement>(`[data-date-key="${dateKey}"]`)?.click();
    await this.wait(HOLD_MS);
  }

  private async runSettingsScene(): Promise<void> {
    this.activeScene.set('settings');
    this.notifications.set(false);
    this.volume.set(0);
    this.stepIndex.set(0);
    await this.wait(SCENE_ENTER_MS);
    if (this.stopped) return;

    await this.wait(500);
    if (this.stopped) return;
    this.notifications.set(true);
    await this.wait(700);
    if (this.stopped) return;

    await this.tweenTo(this.volume, 70, 1200);
    await this.wait(HOLD_MS);
    if (this.stopped) return;

    for (let index = 1; index < this.stepItems.length && !this.stopped; index++) {
      await this.wait(750);
      this.stepIndex.set(index);
    }
    await this.wait(HOLD_MS);
  }

  private async runFeedbackScene(): Promise<void> {
    this.activeScene.set('feedback');
    this.ratingValue.set(null);
    this.otpValue.set('');
    await this.wait(SCENE_ENTER_MS);
    if (this.stopped) return;

    // Clicking star N sets the rating to N directly (not "increment by one") -- clicking 1 through
    // 5 in order still fills them up one at a time, same as it would if someone actually deliberated
    // over it star by star, rather than jumping straight to 5.
    const stars = this.ratingHost()?.nativeElement.querySelectorAll<HTMLElement>('.s-rating__star');
    for (let star = 0; star < (stars?.length ?? 0) && !this.stopped; star++) {
      stars?.[star]?.click();
      await this.wait(260);
    }
    await this.wait(HOLD_MS);
    if (this.stopped) return;

    await this.typeInto((text) => this.otpValue.set(text), '482913');
    await this.wait(HOLD_MS);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async typeInto(setText: (text: string) => void, text: string): Promise<void> {
    let current = '';
    for (const char of text) {
      if (this.stopped) return;
      current += char;
      setText(current);
      await this.wait(TYPE_MS_PER_CHAR);
    }
  }

  /** Animates `target` from its current value to `to` over `durationMs`, via requestAnimationFrame -- the slider has no CSS transition of its own (a real drag needs 1:1 pointer tracking), so a smooth "someone's adjusting this" motion has to come from stepping the bound value itself. */
  private tweenTo(target: WritableSignal<number>, to: number, durationMs: number): Promise<void> {
    const from = target();
    const start = performance.now();
    return new Promise((resolve) => {
      const step = (now: number) => {
        if (this.stopped) {
          resolve();
          return;
        }
        const progress = Math.min(1, (now - start) / durationMs);
        target.set(Math.round(from + (to - from) * progress));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }
}
