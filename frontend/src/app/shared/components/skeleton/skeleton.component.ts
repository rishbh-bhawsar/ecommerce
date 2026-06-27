import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" *ngFor="let i of Array(count)">
      <div class="skeleton-image skeleton-pulse"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-pulse" [style.width]="'60%'"></div>
        <div class="skeleton-line skeleton-pulse" [style.width]="'40%'"></div>
        <div class="skeleton-line skeleton-pulse" [style.width]="'80%'"></div>
        <div class="skeleton-row">
          <div class="skeleton-line skeleton-pulse" [style.width]="'30%'"></div>
          <div class="skeleton-line skeleton-pulse" [style.width]="'20%'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .skeleton-card { border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .skeleton-image { height: 200px; background: #e0e0e0; }
    .skeleton-content { padding: 16px; }
    .skeleton-line { height: 14px; background: #e0e0e0; border-radius: 4px; margin-bottom: 10px; }
    .skeleton-row { display: flex; justify-content: space-between; margin-top: 8px; }
    .skeleton-pulse { animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class SkeletonComponent {
  @Input() count = 6;
  Array = Array;
}
