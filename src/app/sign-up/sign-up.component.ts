import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiAreaService } from '../services/api-area.service';
import { ToastService } from '../services/toast.service';
import {
  GsapRevealDirective,
  GsapMagneticDirective,
} from '../../directives/motion.directives';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, GsapRevealDirective, GsapMagneticDirective],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  private service = inject(ApiAreaService);
  private toast = inject(ToastService);

  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  errAlert = false;
  successRegister = false;
  errorList: any[] = [];

  protected signUpForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(7)]),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required, Validators.minLength(8)]),
    zipcode: new FormControl('', Validators.required),
    avatar: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
  });

  protected invalid(name: string): boolean {
    const control: AbstractControl | null = this.signUpForm.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  protected errorFor(name: string): string {
    const control = this.signUpForm.get(name);
    if (!control?.errors) return '';
    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['minlength']) {
      const need = control.errors['minlength'].requiredLength;
      return `Use at least ${need} characters.`;
    }
    return 'Check this field.';
  }

  signUp() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.toast.error('Some details need fixing', 'Check the highlighted fields.');
      return;
    }

    this.service.register(this.signUpForm.value).subscribe({
      next: () => {
        this.errAlert = false;
        this.errorList = [];
        this.successRegister = true;
        this.toast.success('Account created', 'You can sign in now.');

        setTimeout(() => this.closeEmit.emit(false), 1000);
      },
      error: (err) => {
        this.successRegister = false;
        this.errorList = err.error?.errorKeys ?? ['Something went wrong. Please try again.'];
        this.toast.error("We couldn't create the account");
      },
    });
  }

  closeForm() {
    this.closeEmit.emit(false);
  }
}
