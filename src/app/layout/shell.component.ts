import { Component, signal, inject, OnInit, HostListener } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material/material.module';
import { DashboardHeaderComponent } from './components/dashboard-header.component';
import { SidebarNavComponent } from './components/sidebar-nav.component';
import { ProgressBarComponent } from '../shared/components/progress-bar/progress-bar.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    DashboardHeaderComponent,
    SidebarNavComponent,
    ProgressBarComponent
],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [
    trigger('sidenavAnimation', [
      state('open', style({ transform: 'translateX(0)' })),
      state('closed', style({ transform: 'translateX(-100%)' })),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ]
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly sidenavOpen = signal(true); // Open by default
  readonly isMobile = signal(false);
  readonly isLargeScreen = signal(window.innerWidth >= 960);

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const isMobileScreen = window.innerWidth < 960;
    const isLarge = window.innerWidth >= 960;
    
    this.isMobile.set(isMobileScreen);
    this.isLargeScreen.set(isLarge);
    
    // On desktop (large screen), always keep sidebar open
    // On mobile, start with closed state
    if (isLarge) {
      this.sidenavOpen.set(true);
    } else {
      this.sidenavOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidenavOpen.update(v => !v);
  }

  closeSidebar(): void {
    // Only auto-close on mobile
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }
}

