import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly snack: MatSnackBar) {}

  show(message: string, action: string = 'Close', durationMs = 4000): void {
    this.snack.open(message, action, { duration: durationMs, verticalPosition: 'bottom' });
  }
}
