import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="loadingService.isLoading">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
  `]
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
