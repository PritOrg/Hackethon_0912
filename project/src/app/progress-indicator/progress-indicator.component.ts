import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.css'
})
export class ProgressIndicatorComponent {
  @Input() remainingLeave: number = 0;
  @Input() color: string = 'primary';
  @Input() mode: string = 'determinate';

  get value(): number {
    return (this.remainingLeave / 30) * 100; 
  }
}
