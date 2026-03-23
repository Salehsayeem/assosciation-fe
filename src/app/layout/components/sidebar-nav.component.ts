import { Component, inject, input, output, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MaterialModule } from '../../shared/material/material.module';
import { MenuService } from '../../core/services/menu.service';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  template: `
    <mat-nav-list>
      <mat-divider></mat-divider>
    
      @for (item of menuItems(); track item; let i = $index) {
        <!-- Parent menu item -->
        <mat-list-item
          [routerLink]="item.route || null"
          [routerLinkActive]="item.route ? 'active' : ''"
          (click)="onMenuItemClick(item, i)"
          class="menu-item"
          [class.has-children]="item.children && item.children.length > 0"
          [@slideIn]="'in'"
          >
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.name }}</span>
          @if (item.children && item.children.length > 0) {
            <mat-icon
              matListItemMeta
              class="expand-icon"
              fontSet="material-icons"
              [fontIcon]="expandedIndex() === i ? 'remove' : 'add'">
            </mat-icon>
          }
        </mat-list-item>
        <!-- Submenu items (recursive) -->
        @if (item.children && item.children.length > 0 && expandedIndex() === i) {
          @for (subItem of item.children; track subItem; let subIndex = $index) {
            <mat-list-item
              [routerLink]="subItem.route || null"
              [routerLinkActive]="subItem.route ? 'active' : ''"
              (click)="onSubMenuItemClick(subItem, i, subIndex)"
              class="submenu-item"
              [class.has-children]="subItem.children && subItem.children.length > 0"
              [@slideIn]="'in'"
              >
              <!-- Animated dropdown indicator icon -->
              <mat-icon matListItemIcon class="submenu-icon">
                {{ (subItem.children && subItem.children.length > 0 && isSubMenuExpanded(i, subIndex)) ? 'remove' : (subItem.children && subItem.children.length > 0 ? 'add' : 'keyboard_arrow_right') }}
              </mat-icon>
              <span matListItemTitle>{{ subItem.name }}</span>
              @if (subItem.children && subItem.children.length > 0) {
                <mat-icon
                  matListItemMeta
                  class="expand-icon"
                  fontSet="material-icons"
                  [fontIcon]="isSubMenuExpanded(i, subIndex) ? 'remove' : 'add'">
                </mat-icon>
              }
            </mat-list-item>
            <!-- 3rd level items (Sub-submenu) -->
            @if (subItem.children && subItem.children.length > 0 && isSubMenuExpanded(i, subIndex)) {
              @for (subSubItem of subItem.children; track subSubItem) {
                <mat-list-item
                  [routerLink]="subSubItem.route"
                  routerLinkActive="active"
                  (click)="closeSidebar.emit()"
                  class="subsubmenu-item"
                  [@slideIn]="'in'"
                  >
                  <mat-icon matListItemIcon class="subsubmenu-icon">keyboard_arrow_right</mat-icon>
                  <span matListItemTitle>{{ subSubItem.name }}</span>
                </mat-list-item>
              }
            }
          }
        }
      }
    </mat-nav-list>
    `,
  styles: [`
    mat-nav-list {
      padding: 0;
    }

    .menu-title {
      display: block;
      padding: 1rem;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.54);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .menu-item {
      margin: 0.25rem 0;
      border-radius: 0.25rem;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.active {
        background-color: rgba(103, 58, 183, 0.12);
        color: #673ab7;

        mat-icon {
          color: #673ab7;
        }
      }

      &.has-children {
        cursor: pointer;

        .expand-icon {
          cursor: pointer;
        }
      }
    }

    .submenu-item {
      margin-left: 1rem;
      padding-left: 0.5rem;
      border-left: 2px solid rgba(103, 58, 183, 0.3);
      border-radius: 0;
      background-color: rgba(103, 58, 183, 0.05);
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(103, 58, 183, 0.1);
        border-left-color: rgba(103, 58, 183, 0.6);
      }

      &.active {
        background-color: rgba(103, 58, 183, 0.12);
        color: #673ab7;
        border-left-color: #673ab7;

        mat-icon {
          color: #673ab7;
        }
      }

      &.has-children {
        cursor: pointer;
      }

      .submenu-icon {
        font-size: 0.9rem;
        width: 0.9rem;
        height: 0.9rem;
        color: #673ab7;
        transition: transform 200ms ease;
      }
    }

    /* Animate dropdown indicator on hover */
    .submenu-item:hover .submenu-icon {
      transform: translateX(4px);
    }

    .subsubmenu-item {
      margin-left: 2rem;
      padding-left: 0.5rem;
      border-left: 2px solid rgba(103, 58, 183, 0.2);
      border-radius: 0;
      background-color: rgba(103, 58, 183, 0.02);
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(103, 58, 183, 0.08);
        border-left-color: rgba(103, 58, 183, 0.5);
      }

      &.active {
        background-color: rgba(103, 58, 183, 0.1);
        color: #673ab7;
        border-left-color: #673ab7;

        mat-icon {
          color: #673ab7;
        }
      }

      .subsubmenu-icon {
        font-size: 0.8rem;
        width: 0.8rem;
        height: 0.8rem;
        color: rgba(103, 58, 183, 0.6);
        transition: transform 200ms ease;
      }
    }

    .subsubmenu-item:hover .subsubmenu-icon {
      transform: translateX(4px);
    }

    .permission-badge {
      display: flex;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }

    .perm {
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #673ab7;
      color: white;
      font-size: 0.65rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    @media (max-width: 600px) {
      .menu-title {
        padding: 0.75rem;
        font-size: 0.85rem;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class SidebarNavComponent {
  private readonly menu = inject(MenuService);

  menuItems = this.menu.menuItems;
  closeSidebar = output<void>();
  expandedIndex = signal<number | null>(null);
  expandedSubMenus = signal<Map<string, boolean>>(new Map());

  onMenuItemClick(item: any, index: number): void {
    // If item has children, toggle expand/collapse
    if (item.children && item.children.length > 0) {
      this.expandedIndex.set(this.expandedIndex() === index ? null : index);
    } else if (item.route) {
      // If no children and has route, close the submenu
      this.expandedIndex.set(null);
      this.closeSidebar.emit();
    }
  }

  onSubMenuItemClick(subItem: any, parentIndex: number, subIndex: number): void {
    // If subitem has children, toggle expand/collapse
    if (subItem.children && subItem.children.length > 0) {
      const key = `${parentIndex}-${subIndex}`;
      const currentMap = new Map(this.expandedSubMenus());
      currentMap.set(key, !currentMap.get(key));
      this.expandedSubMenus.set(currentMap);
    } else if (subItem.route) {
      // If no children and has route, close the sidebar on mobile
      this.closeSidebar.emit();
    }
  }

  isSubMenuExpanded(parentIndex: number, subIndex: number): boolean {
    const key = `${parentIndex}-${subIndex}`;
    return this.expandedSubMenus().get(key) ?? false;
  }
}
