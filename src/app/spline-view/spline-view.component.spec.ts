import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplineViewComponent } from './spline-view.component';

describe('SplineViewComponent', () => {
  let component: SplineViewComponent;
  let fixture: ComponentFixture<SplineViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplineViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplineViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
