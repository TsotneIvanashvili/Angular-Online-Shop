import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toasts" role="status" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast glass" [class]="'toast--' + t.kind">
          <i class="toast__icon" [class]="icon(t.kind)"></i>
          <div class="toast__body">
            <p class="toast__title">{{ t.title }}</p>
            @if (t.detail) { <p class="toast__detail">{{ t.detail }}</p> }
          </div>
          <button class="toast__close" (click)="toast.dismiss(t.id)" aria-label="Dismiss notification">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      pointer-events: none;
      max-width: min(360px, calc(100vw - 2.5rem));
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      padding: 0.8rem 0.9rem;
      border-radius: var(--r-md);
      animation: toast-in 320ms var(--spring) both;
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }

    .toast__icon {
      flex-shrink: 0;
      font-size: 0.9rem;
      margin-top: 0.15rem;
    }
    .toast--success .toast__icon { color: var(--ok); }
    .toast--error   .toast__icon { color: var(--bad); }
    .toast--info    .toast__icon { color: var(--accent); }

    .toast__body { flex: 1; min-width: 0; }

    .toast__title {
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }

    .toast__detail {
      font-size: 0.8125rem;
      color: var(--text-2);
      line-height: 1.5;
      margin-top: 0.1rem;
    }

    .toast__close {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
      border-radius: var(--r-xs);
      color: var(--text-3);
      font-size: 0.75rem;
      transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
    }
    .toast__close:hover { background: rgba(255,255,255,0.07); color: var(--text); }

    @media (max-width: 560px) {
      .toasts { left: 1rem; right: 1rem; bottom: 1rem; max-width: none; }
    }
  `],
})
export class ToastComponent {
  protected toast = inject(ToastService);

  protected icon(kind: string): string {
    if (kind === 'success') return 'fa-solid fa-circle-check';
    if (kind === 'error') return 'fa-solid fa-circle-exclamation';
    return 'fa-solid fa-circle-info';
  }
}
