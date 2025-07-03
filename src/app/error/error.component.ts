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

  // Convert rem to px
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  // Calculate min, preferred, max sizes in px
  const minFontPx = 2 * rootFontSize;    // 2rem
  const maxFontPx = 8 * rootFontSize;    // 8rem
  const preferredFontPx = window.innerWidth * 0.08;  // 8vw

  // Clamp font size manually
  const fontPx = Math.min(Math.max(preferredFontPx, minFontPx), maxFontPx);

  const fontWeight = 900;
  const fontFamily = 'inherit';
  const color = '#fff';

  const computedFont =
    fontFamily === 'inherit'
      ? getComputedStyle(canvas).fontFamily || 'sans-serif'
      : fontFamily;

  const fontSizePxStr = `${fontPx}px`;

  // Now use pixel font size for canvas
  ctx.font = `${fontWeight} ${fontSizePxStr} ${computedFont}`;
  ctx.textBaseline = 'alphabetic';

  // Measure text size
  const m = ctx.measureText(text);

  const left = m.actualBoundingBoxLeft ?? 0;
  const right = m.actualBoundingBoxRight ?? m.width;
  const asc = m.actualBoundingBoxAscent ?? fontPx;
  const desc = m.actualBoundingBoxDescent ?? fontPx * 0.2;

  const textW = Math.ceil(left + right);
  const textH = Math.ceil(asc + desc);

  // Prepare offscreen canvas
  const off = document.createElement('canvas');
  const offCtx = off.getContext('2d')!;
  off.width = textW + 10;
  off.height = textH;
  offCtx.font = `${fontWeight} ${fontSizePxStr} ${computedFont}`;
  offCtx.fillStyle = color;
  offCtx.textBaseline = 'alphabetic';
  offCtx.fillText(text, 5 - left, asc);

  const fuzz = 30;
  const hPad = 50;
  const vPad = 0;

  canvas.width = off.width + hPad * 2;
  canvas.height = off.height + vPad * 2;
  ctx.translate(hPad, vPad);

  // ... rest of your animation code unchanged
}

}
