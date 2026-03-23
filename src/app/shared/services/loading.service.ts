import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Increment active request counter and show loader
   */
  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Decrement active request counter and hide loader when no active requests
   */
  hide(): void {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.loadingSubject.next(false);
    }
  }

  /**
   * Force hide the loader (use with caution)
   */
  forceHide(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
