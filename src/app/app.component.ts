import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { MotionService } from './services/motion.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private motion = inject(MotionService);

  ngAfterViewInit(): void {
    // The smoother needs the wrapper/content nodes to exist first.
    this.motion.init();
  }

  ngOnDestroy(): void {
    this.motion.destroy();
  }
}
