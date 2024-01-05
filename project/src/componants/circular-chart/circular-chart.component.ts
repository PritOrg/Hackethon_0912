import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circular-chart',
  templateUrl: './circular-chart.component.html',
  styleUrl: './circular-chart.component.css'
})
export class CircularChartComponent {
  @Input() percentage: number = 0;
  circle: any;
  ngOnInit() {
    const rotation = (this.percentage / 100) * 360;
    this.circle.nativeElement.style.transform = `rotate(${rotation}deg)`;
  }
  calculateRotation(): string {
    const rotation = (this.percentage / 100) * 360;
    return `${rotation}deg`;
  }
}
