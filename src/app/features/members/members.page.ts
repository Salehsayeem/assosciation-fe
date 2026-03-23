import { Component } from '@angular/core';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [MaterialModule],
  template: `<mat-card><h2>Members</h2><p>Protected members feature placeholder.</p></mat-card>`
})
export class MembersPageComponent {}
