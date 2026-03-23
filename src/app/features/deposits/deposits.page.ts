import { Component } from '@angular/core';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-deposits-page',
  standalone: true,
  imports: [MaterialModule],
  template: `<mat-card><h2>Deposits</h2><p>Protected deposits feature placeholder.</p></mat-card>`
})
export class DepositsPageComponent {}
