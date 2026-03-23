import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    @if (loading$ | async) {
      <mat-progress-bar
        mode="indeterminate"
        class="progress-bar">
      </mat-progress-bar>
    }
    `,
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  private loadingService = inject(LoadingService);
  loading$: Observable<boolean> = this.loadingService.loading$;
}
