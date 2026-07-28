import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  success(title: string, detail?: string) { this.push('success', title, detail); }
  error(title: string, detail?: string) { this.push('error', title, detail, 6000); }
  info(title: string, detail?: string) { this.push('info', title, detail); }

  dismiss(id: number) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(kind: ToastKind, title: string, detail?: string, ttl = 4000) {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, kind, title, detail }].slice(-4));
    this.timers.set(id, setTimeout(() => this.dismiss(id), ttl));
  }
}
