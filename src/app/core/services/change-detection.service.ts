import { Injectable, inject, NgZone } from '@angular/core';
import { Observable, OperatorFunction, tap } from 'rxjs';

/**
 * Service for managing async operations within Angular's zone.
 * ChangeDetectorRef must be handled at the component level (in BaseComponent).
 */
@Injectable({ providedIn: 'root' })
export class ChangeDetectionService {
  private readonly ngZone = inject(NgZone);

  /**
   * Wrapper to run a function within Angular's zone.
   * Component must call markForCheck() on ChangeDetectorRef separately.
   *
   * @param fn Function to run within the zone
   */
  runInZone<T>(fn: () => T): T {
    return this.ngZone.run(() => fn());
  }

  /**
   * Get the NgZone instance for advanced usage.
   */
  getZone(): NgZone {
    return this.ngZone;
  }
}
