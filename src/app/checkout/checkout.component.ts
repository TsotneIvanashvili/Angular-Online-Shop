import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { CartStateService } from '../services/cart-state.service';
import { ToastService } from '../services/toast.service';
import {
  GsapRevealDirective,
  GsapSplitDirective,
  GsapMagneticDirective,
} from '../../directives/motion.directives';

/** Rejects card numbers that fail a Luhn check. */
function luhn(control: AbstractControl): ValidationErrors | null {
  const digits = (control.value ?? '').toString().replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length < 13 || digits.length > 19) return { card: true };

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0 ? null : { card: true };
}

/** Rejects an expiry that is not MM/YY, or is already in the past. */
function expiry(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '').toString().trim();
  if (!value) return null;

  const match = value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return { expiry: true };

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return { expiry: true };

  const endOfMonth = new Date(year, month, 1).getTime();
  return endOfMonth > Date.now() ? null : { expired: true };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    CurrencyPipe,
    GsapRevealDirective,
    GsapSplitDirective,
    GsapMagneticDirective,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  protected cart = inject(CartStateService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private router = inject(Router);

  protected submitting = false;
  protected placed = false;
  protected orderRef = '';

  protected form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', Validators.required],
    zip: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9 -]{3,10}$/)]],
    country: ['Georgia', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, luhn]],
    cardExpiry: ['', [Validators.required, expiry]],
    cardCvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  protected readonly countries = [
    'Georgia', 'Germany', 'United Kingdom', 'United States',
    'France', 'Netherlands', 'Poland', 'Türkiye',
  ];

  ngOnInit(): void {
    this.cart.refresh();
  }

  protected control(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  protected invalid(name: string): boolean {
    const c = this.control(name);
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: string): string {
    const c = this.control(name);
    if (!c.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['email']) return 'Enter a valid email address.';
    if (c.errors['card']) return 'That card number is not valid.';
    if (c.errors['expiry']) return 'Use the MM/YY format.';
    if (c.errors['expired']) return 'That card has expired.';
    if (c.errors['minlength']) return 'That looks too short.';
    if (c.errors['pattern']) return 'Check the format of this field.';
    return 'Check this field.';
  }

  /** Formats the card number into groups of four as it is typed. */
  protected formatCard() {
    const control = this.control('cardNumber');
    const digits = (control.value ?? '').replace(/\D/g, '').slice(0, 19);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    control.setValue(grouped, { emitEvent: false });
  }

  protected formatExpiry() {
    const control = this.control('cardExpiry');
    let digits = (control.value ?? '').replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    control.setValue(digits, { emitEvent: false });
  }

  protected placeOrder() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Some details need fixing', 'Check the highlighted fields.');
      return;
    }

    if (!this.cart.lines().length) {
      this.toast.error('Your cart is empty', 'Add something before checking out.');
      return;
    }

    this.submitting = true;

    // No payment provider is wired up — this simulates the round trip so
    // the confirmation step can be exercised end to end.
    setTimeout(() => {
      this.submitting = false;
      this.placed = true;
      this.orderRef = this.buildOrderRef();
      this.toast.success('Order placed', `Reference ${this.orderRef}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  }

  private buildOrderRef(): string {
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    const rand = Math.floor(Math.random() * 900 + 100);
    return `TS-${stamp}-${rand}`;
  }

  protected backToShop() {
    this.router.navigate(['/shop']);
  }
}
