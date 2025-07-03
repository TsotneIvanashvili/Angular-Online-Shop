import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
  imports: [RouterModule]
})
export class ErrorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationId = 0;
  private cleanupListeners: (() => void)[] = [];

  ngAfterViewInit() {
    this.drawFuzzyText('404');
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.cleanupListeners.forEach(fn => fn());
  }

  private async drawFuzzyText(text: string) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (document.fonts?.ready) await document.fonts.ready;

    const fontSize = 'clamp(2rem, 8vw, 8rem)';
    const fontWeight = 900;
    const fontFamily = 'inherit';
    const color = '#fff';
    const enableHover = true;
    const baseIntensity = 0.18;
    const hoverIntensity = 0.5;

    const computedFont =
      fontFamily === 'inherit'
        ? getComputedStyle(canvas).fontFamily || 'sans-serif'
        : fontFamily;

    const sizeInPx = (() => {
      const el = document.createElement('span');
      el.style.fontSize = fontSize;
      document.body.appendChild(el);
      const px = parseFloat(getComputedStyle(el).fontSize);
      el.remove();
      return px;
    })();

    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d')!;
    offCtx.font = `${fontWeight} ${fontSize} ${computedFont}`;
    offCtx.textBaseline = 'alphabetic';
    const m = offCtx.measureText(text);

    const left = m.actualBoundingBoxLeft ?? 0;
    const right = m.actualBoundingBoxRight ?? m.width;
    const asc = m.actualBoundingBoxAscent ?? sizeInPx;
    const desc = m.actualBoundingBoxDescent ?? sizeInPx * 0.2;

    const textW = Math.ceil(left + right);
    const textH = Math.ceil(asc + desc);

    const fuzz = 30;
    const hPad = 50;
    const vPad = 0;

    off.width = textW + 10;
    off.height = textH;
    offCtx.font = `${fontWeight} ${fontSize} ${computedFont}`;
    offCtx.fillStyle = color;
    offCtx.fillText(text, 5 - left, asc);

    canvas.width = off.width + hPad * 2;
    canvas.height = off.height + vPad * 2;
    ctx.translate(hPad, vPad);

    let hovering = false;
    const hitLeft = hPad + 5;
    const hitTop = vPad;
    const hitRight = hitLeft + textW;
    const hitBottom = hitTop + textH;

    const inside = (x: number, y: number) =>
      x >= hitLeft && x <= hitRight && y >= hitTop && y <= hitBottom;

    const onMove = (e: MouseEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      const x = 'clientX' in e ? e.clientX - rect.left : 0;
      const y = 'clientY' in e ? e.clientY - rect.top : 0;
      hovering = inside(x, y);
    };

    const add = (el: HTMLElement, type: string, fn: any, opts?: any) => {
      el.addEventListener(type, fn, opts);
      this.cleanupListeners.push(() => el.removeEventListener(type, fn, opts));
    };

    if (enableHover) {
      add(canvas, 'mousemove', onMove);
      add(canvas, 'mouseleave', () => (hovering = false));
      add(canvas, 'touchmove', (e: TouchEvent) => {
        onMove(e.touches[0]);
        e.preventDefault();
      }, { passive: false });
      add(canvas, 'touchend', () => (hovering = false));
    }

    const draw = () => {
      const intensity = hovering ? hoverIntensity : baseIntensity;
      ctx.clearRect(-fuzz, -fuzz, off.width + fuzz * 2, off.height + fuzz * 2);
      for (let y = 0; y < off.height; y++) {
        const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzz);
        ctx.drawImage(off, 0, y, off.width, 1, dx, y, off.width, 1);
      }
      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }
}
