import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FeatureApiService } from '../feature-api';
import { Role } from '../../core/models/response/role.response';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { TableStateService } from '../../shared/services/table-state.service';
import {
  ManagePermissionsSheetComponent,
  ManagePermissionsData,
  EditableFeature
} from './manage-permissions-sheet.component';

interface PermissionRow {
  feature: string;
  featureId: number;
  permissions: string[];
}

@Component({
  selector: 'app-role-permissions-page',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './role-permissions.page.html',
  styleUrls: ['./role-permissions.page.scss']
})
export class RolePermissionsPageComponent implements OnInit, AfterViewInit {
  private readonly api = inject(FeatureApiService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly notify = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly tableState = inject(TableStateService);

  isLoading = false;
  isLoadingFeatures = false;
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
        if (res?.isSuccess) {
          const permissionMap =
            res.data && typeof res.data === 'object' ? res.data : {};

          const rows: PermissionRow[] = Object.keys(permissionMap).map((feature) => ({
            feature,
            featureId: permissionMap[feature]?.feature_Id ?? 0,
            permissions: permissionMap[feature]?.permissions || []
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

  openManageDrawer(): void {
    if (!this.selectedRoleId || this.dataSource.data.length === 0) return;
    const role = this.roles.find(r => r.roleId === this.selectedRoleId);

    const features: EditableFeature[] = this.dataSource.data.map(row => ({
      featureId: row.featureId,
      featureName: row.feature,
      isCreate: row.permissions.includes('CREATE'),
      isRead: row.permissions.includes('READ'),
      isDelete: row.permissions.includes('DELETE')
    }));

    const data: ManagePermissionsData = {
      roleId: this.selectedRoleId,
      roleName: role?.name ?? 'Unknown Role',
      features,
      mode: 'manage'
    };

    const ref = this.bottomSheet.open(ManagePermissionsSheetComponent, {
      data,
      panelClass: 'role-permissions-bottom-sheet'
    });

    ref.afterDismissed().subscribe((refreshNeeded: boolean) => {
      if (refreshNeeded && this.selectedRoleId) {
        this.loadPermissions(this.selectedRoleId);
      }
    });
  }

  openAddDrawer(): void {
    if (!this.selectedRoleId || this.isLoadingFeatures) return;

    const role = this.roles.find(r => r.roleId === this.selectedRoleId);
    const appIdStr = this.auth.user()?.applicationId;
    const applicationId = appIdStr ? parseInt(appIdStr, 10) : 1;

    this.isLoadingFeatures = true;
    this.api.getAvailableFeatures(applicationId).subscribe({
      next: (res) => {
        this.isLoadingFeatures = false;
        if (!res?.isSuccess) {
          this.notify.show(res?.message || 'Failed to load available features', 'Close', 6000);
          return;
        }

        const features: EditableFeature[] = (res.data || []).map((feature) => ({
          featureId: feature.featureId,
          featureName: feature.name,
          isCreate: false,
          isRead: false,
          isDelete: false
        }));

        if (features.length === 0) {
          this.notify.show('No available features to add for this role');
          return;
        }

        const data: ManagePermissionsData = {
          roleId: this.selectedRoleId!,
          roleName: role?.name ?? 'Unknown Role',
          features,
          mode: 'add'
        };

        const ref = this.bottomSheet.open(ManagePermissionsSheetComponent, {
          data,
          panelClass: 'role-permissions-bottom-sheet'
        });

        ref.afterDismissed().subscribe((refreshNeeded: boolean) => {
          if (refreshNeeded && this.selectedRoleId) {
            this.loadPermissions(this.selectedRoleId);
          }
        });
      },
      error: (err) => {
        this.isLoadingFeatures = false;
        this.notify.show(
          err?.userMessage ?? err?.error?.message ?? 'Failed to load available features',
          'Close',
          6000
        );
      }
    });
  }
}
