import { Component, OnInit } from '@angular/core';
import { SignInComponent } from '../sign-in/sign-in.component';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { ScrollingDirective } from '../../directives/scrolling.directive';
import { RouterModule } from '@angular/router';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { ToolsService } from '../services/tools.service';

@Component({
  selector: 'app-navbar',
  imports: [SignInComponent, SignUpComponent, ScrollingDirective, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
})
export class NavbarComponent implements OnInit {
  constructor(public _cookie: SsrCookieService, public tools: ToolsService) {}

  public isSignShow: boolean = false;
  public isRegisterShow: boolean = false;
  public isLoggedIn: boolean = false;
  public userImg: string | null = sessionStorage.getItem('userAvatar');
  public userName: string | null = sessionStorage.getItem('userName');

  ngOnInit(): void {
    this.isLoggedIn = !!this.userName; // Set initial login state
    this.tools.isSignedIn.subscribe((info: boolean) => {
      this.isSignShow = info;
    });
    this.tools.isRegistered.subscribe((info: boolean) => {
      this.isRegisterShow = info;
    });
  }

  signInForm() {
    this.tools.isSignedIn.next(true);
    this.isRegisterShow = false; // Ensure register modal is closed
  }

  signOut() {
    this._cookie.deleteAll();
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.userImg = null;
    this.userName = null;
  }

  showRegister() {
    this.tools.isSignedIn.next(false);
    this.tools.isRegistered.next(true);
  }

  closeForm(close: boolean) {
    this.isSignShow = close;
  }

  closeRegister(close: boolean) {
    this.isRegisterShow = close;
  }

  loggedIn(logg: boolean) {
    this.isLoggedIn = logg;
  }

  profileInfoNav(info: any) {
    this.userImg = info.avatar;
    this.userName = info.firstName;
    sessionStorage.setItem('userAvatar', info.avatar);
    sessionStorage.setItem('userName', info.firstName);
  }
}