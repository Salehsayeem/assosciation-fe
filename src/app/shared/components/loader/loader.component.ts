import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading$ | async) {
      <div class="loader-overlay">
        <div class="loader-container">
          <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
          </div>
          <div class="loader-text">Loading...</div>
        </div>
      </div>
    }
    `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  private loadingService = inject(LoadingService);
  loading$: Observable<boolean> = this.loadingService.loading$;
}
