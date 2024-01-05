import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularChartComponent } from './circular-chart.component';

describe('CircularChartComponent', () => {
  let component: CircularChartComponent;
  let fixture: ComponentFixture<CircularChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircularChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircularChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
