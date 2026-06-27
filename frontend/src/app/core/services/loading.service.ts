import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = 0;
  private loading = false;

  get isLoading(): boolean {
    return this.loading;
  }

  show(): void {
    this.loadingCount++;
    this.loading = true;
  }

  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loading = false;
    }
  }
}
