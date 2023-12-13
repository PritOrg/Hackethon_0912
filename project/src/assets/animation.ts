// animations.ts
import { trigger, transition, style, animate } from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOut', [
    transition(':enter', [style({ opacity: 0 }), animate('0.5s', style({ opacity: 1 }))]),
    transition(':leave', [style({ opacity: 1 }), animate('0.5s', style({ opacity: 0 }))]),
]);
