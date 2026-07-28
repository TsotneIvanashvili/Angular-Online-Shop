import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToolsService } from '../services/tools.service';

@Component({
  selector: 'app-sign-err',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sign-err.component.html',
  styleUrl: './sign-err.component.css',
})
export class SignErrComponent implements OnInit, OnDestroy {
  private tools = inject(ToolsService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private sub = new Subscription();

  protected isShown = false;

  ngOnInit(): void {
    // See QuickViewComponent: ScrollSmoother's transform on #smooth-content
    // would otherwise break this dialog's `position: fixed`.
    if (typeof document !== 'undefined') {
      document.body.appendChild(this.host.nativeElement);
    }

    this.sub.add(
      this.tools.isErrSMS.subscribe((info: boolean) => {
        this.isShown = info;
        if (typeof document !== 'undefined') {
          document.body.style.overflow = info ? 'hidden' : '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (typeof document !== 'undefined') document.body.style.overflow = '';
    this.host.nativeElement.remove();
  }

  @HostListener('document:keydown.escape')
  protected closeErr() {
    this.tools.isErrSMS.next(false);
  }

  protected outSide(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('gate')) {
      this.closeErr();
    }
  }
}
