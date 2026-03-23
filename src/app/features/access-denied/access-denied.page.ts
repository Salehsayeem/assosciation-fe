import { Component } from '@angular/core';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-access-denied-page',
  standalone: true,
  imports: [MaterialModule],
  template: `<mat-card><h2>Access Denied</h2><p>You do not have permission to access this page.</p></mat-card>`
})
export class AccessDeniedPageComponent {}
