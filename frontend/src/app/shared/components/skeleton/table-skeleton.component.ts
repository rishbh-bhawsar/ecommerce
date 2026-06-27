import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-skeleton">
      <div class="skeleton-row header" *ngFor="let col of Array(columns)">
        <div class="skeleton-cell skeleton-pulse"></div>
      </div>
      <div class="skeleton-row" *ngFor="let i of Array(rows)">
        <div class="skeleton-cell skeleton-pulse" *ngFor="let col of Array(columns)"></div>
      </div>
    </div>
  `,
  styles: [`
    .table-skeleton { width: 100%; }
    .skeleton-row { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #eee; }
    .skeleton-row.header { background: #f5f5f5; border-radius: 4px; }
    .skeleton-cell { height: 20px; background: #e0e0e0; border-radius: 4px; flex: 1; }
    .skeleton-pulse { animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class TableSkeletonComponent {
  @Input() rows = 5;
  @Input() columns = 5;
  Array = Array;
}
