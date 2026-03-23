import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FeatureApiService } from '../feature-api';
import { Role } from '../../core/models/response/role.response';
import { TableStateService } from '../../shared/services/table-state.service';

interface PermissionRow {
  feature: string;
  permissions: string[];
}

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './permissions.page.html',
  styleUrls: ['./permissions.page.scss']
})
export class PermissionsPageComponent implements OnInit, AfterViewInit {
  private readonly api = inject(FeatureApiService);
  private readonly tableState = inject(TableStateService);

  isLoading = false;
  error: string | null = null;
  permissionError: string | null = null;

  roles: Role[] = [];
  selectedRoleId: string | null = null;

  displayedColumns = ['id', 'feature', 'permissions'];
  dataSource = new MatTableDataSource<PermissionRow>([]);

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

  ngOnInit(): void {
    this.loadRolesAndInit();
  }

  ngAfterViewInit(): void {
    this.tableState.bindControls(this.dataSource, this.tablePaginator, this.tableSort);
  }

  loadRolesAndInit(): void {
    this.isLoading = true;
    this.error = null;
    this.permissionError = null;
    this.api.getAllRoles().subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.roles = res.data || [];
          this.selectedRoleId = this.roles.length ? this.roles[0].roleId : null;
          if (this.selectedRoleId) {
            this.loadPermissions(this.selectedRoleId);
          } else {
            this.isLoading = false;
            this.permissionError = 'No roles available';
          }
        } else {
          this.isLoading = false;
          this.error = res?.message || 'Failed to load roles';
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load roles';
      }
    });
  }

  onRoleChange(roleId: string): void {
    this.selectedRoleId = roleId;
    this.loadPermissions(roleId);
  }

  private loadPermissions(roleId: string): void {
    this.isLoading = true;
    this.permissionError = null;
    this.api.getPermissionsByRole(roleId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const rows: PermissionRow[] = Object.keys(res.data).map((feature) => ({
            feature,
            permissions: res.data[feature]?.permissions || []
          }));
          this.dataSource.data = rows;
          if (rows.length === 0) {
            this.permissionError = null; // No error, just empty
          }
        } else {
          this.dataSource.data = [];
          this.permissionError = res?.message || 'Failed to load permissions for this role';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.permissionError = err?.message || 'Failed to load permissions for this role';
        this.dataSource.data = [];
      }
    });
  }

  // Actions to mirror Users/Roles behavior
  openAddPermissionDialog(): void {
    // TODO: Open create permission dialog (consistent with GenericDialog usage)
  }

  onEditPermission(row: any): void {
    // TODO: Open edit permission dialog with row details
  }

  openDeletePermissionDialog(row: any): void {
    // TODO: Confirm and delete permission
  }
}
