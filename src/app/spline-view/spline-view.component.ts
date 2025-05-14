import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Application } from '@splinetool/runtime';

@Component({
  selector: 'app-spline-view',
  templateUrl: './spline-view.component.html',
  styleUrls: ['./spline-view.component.css']
})
export class SplineViewComponent implements AfterViewInit {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const app = new Application(canvas);

    // 👇 Replace with your actual .splinecode URL
    app.load('https://prod.spline.design/wNBASGONPFK2uzS5/scene.splinecode');
  }
}
