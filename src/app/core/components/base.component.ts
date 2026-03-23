import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionService } from '../services/change-detection.service';

/**
 * Base component class providing utilities for managing change detection.
 * Extend this class in your components to get zone and change detection helpers.
 */
export class BaseComponent {
  protected cdr = inject(ChangeDetectorRef);
  protected cdService = inject(ChangeDetectionService);

  /**
   * Wrap a function to run within Angular's zone.
   */
  protected runInZone<T>(fn: () => T): T {
    return this.cdService.runInZone(fn);
  }

  /**
   * Trigger change detection marking after state changes.
   */
  protected markForCheck(): void {
    this.cdr.markForCheck();
  }
}
