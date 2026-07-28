import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiAreaService } from '../services/api-area.service';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { RouterModule } from '@angular/router';
import { GsapMagneticDirective } from '../../directives/motion.directives';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterModule, GsapMagneticDirective],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  constructor(public api: ApiAreaService, public _cookie: SsrCookieService) {}
  
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() changeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() loggedEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() loggedInfo: EventEmitter<any> = new EventEmitter();

  public accessToken: any;
  public errorSMS: string | undefined;
  public errAlert: boolean = false;
  public successLogin: boolean = false;
  public loading: boolean = false; // Added loading state

  public showPassword: boolean = false;

  protected signInForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required),
  });

  /** True once the field has been touched and is still invalid. */
  protected invalid(name: string): boolean {
    const control = this.signInForm.get(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  signIn() {
    if (this.signInForm.invalid) return;

    this.loading = true;
    this.errAlert = false;
    this.successLogin = false;

    this.api.signIn(this.signInForm.value).subscribe({
      next: (data: any) => {
        this.accessToken = data.access_token;
        this._cookie.set('user', this.accessToken, 0.4);

        this.api.profileInfo().subscribe({
          next: (data: any) => {
            let userInfo = {
              firstName: data.firstName,
              avatar: data.avatar,
            };

            this._cookie.set('userInfo', JSON.stringify(userInfo));
            sessionStorage.setItem('userName', userInfo.firstName);
            sessionStorage.setItem('userAvatar', userInfo.avatar);
            this._cookie.set("cartInfo", data.cartID);

            // Only show success after everything completes
            this.successLogin = true;
            this.errAlert = false;

            setTimeout(() => {
              this.closeEmit.emit(false);
              this.loggedEmit.emit(true);
              window.location.href = '/';
            }, 1000);
          },
          error: (profileErr) => {
            this._cookie.delete('user'); // Clean up on failure
            this.errorSMS = profileErr.error?.error || "We couldn't load your profile";
            this.errAlert = true;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorSMS = err.error?.error || 'That email and password combination did not work.';
        this.errAlert = true;
        // `complete` never fires on the error path, so reset here too or
        // the submit button stays disabled after a failed attempt.
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  closeForm() {
    this.closeEmit.emit(false);
  }

  outSide(event: any) {
    if (event.target.className == 'signArea') {
      this.closeEmit.emit(false);
    }
  }

  change() {
    this.changeEmit.emit(true);
  }
}