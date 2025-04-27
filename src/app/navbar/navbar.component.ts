import { Component, OnInit, HostListener } from '@angular/core';
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
  public isMenuOpen: boolean = false;
  public userImg: string | null = sessionStorage.getItem('userAvatar');
  public userName: string | null = sessionStorage.getItem('userName');

  ngOnInit(): void {
    this.isLoggedIn = !!this.userName;
    this.tools.isSignedIn.subscribe((info: boolean) => {
      this.isSignShow = info;
      if (info) {
        document.body.style.overflow = 'hidden';
        this.closeMenu();
      } else {
        document.body.style.overflow = '';
      }
    });
    
    this.tools.isRegistered.subscribe((info: boolean) => {
      this.isRegisterShow = info;
      if (info) {
        document.body.style.overflow = 'hidden';
        this.closeMenu();
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Close modals if clicking outside
    if (this.isSignShow && !target.closest('app-sign-in')) {
      this.closeForm(false);
    }
    if (this.isRegisterShow && !target.closest('app-sign-up')) {
      this.closeRegister(false);
    }
    
    // Close menu if clicking outside (mobile only)
    if (window.innerWidth <= 570 && this.isMenuOpen && 
        !target.closest('.pages') && 
        !target.closest('.account') &&
        !target.closest('.burger')) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  signInForm() {
    this.tools.isSignedIn.next(true);
    this.isRegisterShow = false;
    this.closeMenu();
  }

  signOut() {
    this._cookie.deleteAll();
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.userImg = null;
    this.userName = null;
    this.closeMenu();
  }

  showRegister() {
    this.tools.isSignedIn.next(false);
    this.tools.isRegistered.next(true);
    this.closeMenu();
  }

  closeForm(close: boolean) {
    this.isSignShow = close;
    if (!close) document.body.style.overflow = '';
  }

  closeRegister(close: boolean) {
    this.isRegisterShow = close;
    if (!close) document.body.style.overflow = '';
  }

  loggedIn(logg: boolean) {
    this.isLoggedIn = logg;
    this.closeMenu();
  }

  profileInfoNav(info: any) {
    this.userImg = info.avatar;
    this.userName = info.firstName;
    sessionStorage.setItem('userAvatar', info.avatar);
    sessionStorage.setItem('userName', info.firstName);
    this.closeMenu();
  }
}