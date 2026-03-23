import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';

import { MaterialModule } from '../../shared/material/material.module';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TableStateService } from '../../shared/services/table-state.service';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [MaterialModule, RouterModule],
  template: `
    <div class="breadcrumb">
      <a [routerLink]="['/members']">Members</a>
      <mat-icon fontSet="material-icons" fontIcon="chevron_right"></mat-icon>
      <span>Permissions</span>
    </div>

    <mat-card>
      <mat-card-header>
        <mat-card-title>Permissions</mat-card-title>
        <mat-card-subtitle>Manage feature permissions</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="table-actions">
          <mat-form-field appearance="outline">
            <mat-label>Filter permissions</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by feature or permission" />
          </mat-form-field>
          <button mat-raised-button color="primary">Add Permission</button>
        </div>

        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z1">
          <!-- Feature Column -->
          <ng-container matColumnDef="feature">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Feature </th>
            <td mat-cell *matCellDef="let row"> {{ row.feature }} </td>
          </ng-container>

          <!-- Permission Column -->
          <ng-container matColumnDef="permission">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Permission </th>
            <td mat-cell *matCellDef="let row"> {{ row.permission }} </td>
          </ng-container>

          <!-- Description Column -->
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Description </th>
            <td mat-cell *matCellDef="let row"> {{ row.description }} </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" aria-label="Edit permission">
                <mat-icon fontSet="material-icons" fontIcon="edit"></mat-icon>
              </button>
              <button mat-icon-button color="warn" aria-label="Delete permission">
                <mat-icon fontSet="material-icons" fontIcon="delete"></mat-icon>
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
export class PermissionsPageComponent implements AfterViewInit {
  private readonly tableState = inject(TableStateService);

  displayedColumns = ['feature', 'permission', 'description', 'actions'];
  dataSource = new MatTableDataSource([
    { feature: 'MEMBER MANAGEMENT', permission: 'READ', description: 'View members' },
    { feature: 'MEMBER MANAGEMENT', permission: 'WRITE', description: 'Create/edit members' },
    { feature: 'PROFILE', permission: 'READ', description: 'View profile' }
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
