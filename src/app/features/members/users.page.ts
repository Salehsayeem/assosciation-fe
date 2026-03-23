import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';

import { MaterialModule } from '../../shared/material/material.module';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TableStateService } from '../../shared/services/table-state.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [MaterialModule, RouterModule],
  template: `
    <div class="breadcrumb">
      <a [routerLink]="['/members']">Members</a>
      <mat-icon fontSet="material-icons" fontIcon="chevron_right"></mat-icon>
      <span>Users</span>
    </div>

    <mat-card>
      <mat-card-header>
        <mat-card-title>Users</mat-card-title>
        <mat-card-subtitle>Manage application users</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="table-actions">
          <mat-form-field appearance="outline">
            <mat-label>Filter users</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, email, role" />
          </mat-form-field>
          <button mat-raised-button color="primary">Add User</button>
        </div>

        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z1">
          <!-- Username Column -->
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Username </th>
            <td mat-cell *matCellDef="let row"> {{ row.username }} </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
            <td mat-cell *matCellDef="let row"> {{ row.email }} </td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Role </th>
            <td mat-cell *matCellDef="let row"> {{ row.role }} </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
            <td mat-cell *matCellDef="let row"> {{ row.status }} </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" aria-label="Edit user">
                <mat-icon fontSet="material-icons" fontIcon="edit"></mat-icon>
              </button>
              <button mat-icon-button color="warn" aria-label="Deactivate user">
                <mat-icon fontSet="material-icons" fontIcon="block"></mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
    .breadcrumb { display: flex; align-items: center; gap: 4px; padding: 8px 0; }
    .breadcrumb a { text-decoration: none; color: inherit; }
    .table-actions { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    table { width: 100%; }
    `
  ]
})
export class UsersPageComponent implements AfterViewInit {
  private readonly tableState = inject(TableStateService);

  displayedColumns = ['username', 'email', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource([
    { username: 'jdoe', email: 'jdoe@example.com', role: 'Admin', status: 'Active' },
    { username: 'asmith', email: 'asmith@example.com', role: 'User', status: 'Inactive' },
    { username: 'bjones', email: 'bjones@example.com', role: 'Moderator', status: 'Active' }
  ]);

  private tablePaginator?: MatPaginator;
  private tableSort?: MatSort;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    this.tablePaginator = paginator;
    this.tableState.bindPaginator(this.dataSource, paginator);
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    this.tableSort = sort;
    this.tableState.bindSort(this.dataSource, sort);
  }

  ngAfterViewInit(): void {
    this.tableState.bindControls(this.dataSource, this.tablePaginator, this.tableSort);
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tableState.applyFilter(this.dataSource, value);
  }
}
