import { Component, ViewChild, AfterViewInit, OnInit, inject, TemplateRef } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FeatureApiService } from '../feature-api';
import {
  GetUsersWithRolesResponse,
  UserFeaturePermission,
  UserWithRolesItem
} from '../../core/models/response/user.response';
import { NotificationService } from '../../shared/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogActionContext, GenericDialogComponent } from '../../shared/components/generic-dialog/generic-dialog.component';
import { TableStateService } from '../../shared/services/table-state.service';

interface EditableUserPermission {
  featureId: number;
  featureName: string;
  isCreate: boolean;
  isRead: boolean;
  isDelete: boolean;
}

type PermissionField = 'isCreate' | 'isRead' | 'isDelete';

@Component({
  selector: 'app-user-permissions-page',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './user-permissions.page.html',
  styleUrls: ['./user-permissions.page.scss']
})
export class UserPermissionsPageComponent implements OnInit, AfterViewInit {
  private readonly api = inject(FeatureApiService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly tableState = inject(TableStateService);

  isLoading = false;
  isSavingPermissions = false;
  error: string | null = null;
  selectedUser: UserWithRolesItem | null = null;
  selectedUserPermissions: EditableUserPermission[] = [];
  private initialSelectedUserPermissions: EditableUserPermission[] = [];

  displayedColumns = ['id', 'email', 'firstName', 'lastName', 'status', 'roles'];
  dataSource = new MatTableDataSource<UserWithRolesItem>([]);
  permissionDisplayedColumns = ['feature', 'create', 'read', 'delete'];

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

  @ViewChild('userPermissionTemplate') userPermissionTemplate!: TemplateRef<any>;

  ngOnInit(): void {
    this.loadUsersWithRoles();
    this.dataSource.filterPredicate = (data, filter) => {
      const roles = Array.isArray(data.roles) ? data.roles.join(' ') : '';
      const combined = [
        data.email,
        data.firstName,
        data.lastName,
        data.status,
        roles,
        this.collectPermissionKeywords(data.permissions)
      ].join(' ').toLowerCase();
      return combined.includes(filter);
    };
  }

  ngAfterViewInit(): void {
    this.tableState.bindControls(this.dataSource, this.tablePaginator, this.tableSort);
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tableState.applyFilter(this.dataSource, value);
  }

  onUserRowClick(user: UserWithRolesItem): void {
    this.selectedUser = user;
    this.selectedUserPermissions = this.mapToEditablePermissions(user.permissions);
    this.initialSelectedUserPermissions = this.cloneEditablePermissions(this.selectedUserPermissions);

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '900px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: `User Permissions • ${user.email}`,
        content: this.userPermissionTemplate,
        contentType: 'template',
        customData: user,
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Save',
            icon: 'save',
            color: 'primary',
            action: (ctx: DialogActionContext) => {
              if (!this.hasPermissionChanges) {
                this.notify.show('No permission changes to save');
                return;
              }
              this.saveSelectedUserPermissions(ctx, () => ref.close());
            }
          }
        ]
      }
    });
  }

  selectAllPermissions(): void {
    if (this.isSavingPermissions || this.selectedUserPermissions.length === 0) return;
    this.selectedUserPermissions = this.selectedUserPermissions.map((permission) => ({
      ...permission,
      isCreate: true,
      isRead: true,
      isDelete: true
    }));
  }

  clearAllPermissions(): void {
    if (this.isSavingPermissions || this.selectedUserPermissions.length === 0) return;
    this.selectedUserPermissions = this.selectedUserPermissions.map((permission) => ({
      ...permission,
      isCreate: false,
      isRead: false,
      isDelete: false
    }));
  }

  onPermissionToggle(permission: EditableUserPermission, field: PermissionField, checked: boolean): void {
    if (this.isSavingPermissions) return;
    permission[field] = checked;
  }

  get hasPermissionChanges(): boolean {
    if (this.selectedUserPermissions.length !== this.initialSelectedUserPermissions.length) return true;

    return this.selectedUserPermissions.some((current, index) => {
      const initial = this.initialSelectedUserPermissions[index];
      return (
        !initial ||
        current.featureId !== initial.featureId ||
        current.isCreate !== initial.isCreate ||
        current.isRead !== initial.isRead ||
        current.isDelete !== initial.isDelete
      );
    });
  }

  get allPermissionsSelected(): boolean {
    return (
      this.selectedUserPermissions.length > 0 &&
      this.selectedUserPermissions.every((permission) => permission.isCreate && permission.isRead && permission.isDelete)
    );
  }

  get anyPermissionSelected(): boolean {
    return this.selectedUserPermissions.some((permission) => permission.isCreate || permission.isRead || permission.isDelete);
  }

  grantedPermissionCount(): number {
    return this.selectedUserPermissions.reduce((count, permission) => {
      return count + Number(permission.isCreate) + Number(permission.isRead) + Number(permission.isDelete);
    }, 0);
  }

  private loadUsersWithRoles(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getUsersWithRoles().subscribe({
      next: (res: GetUsersWithRolesResponse) => {
        if (res?.isSuccess) {
          this.dataSource.data = Array.isArray(res.data) ? res.data : [];
          this.isLoading = false;
          return;
        }

        this.dataSource.data = [];
        const message = res?.message || 'Failed to load users with roles';
        this.error = message;
        this.notify.show(message, 'Close', 6000);
        this.isLoading = false;
      },
      error: (err) => {
        this.dataSource.data = [];
        const message = err?.userMessage ?? err?.error?.message ?? 'Failed to load users with roles';
        this.error = message;
        this.notify.show(message, 'Close', 6000);
        this.isLoading = false;
      }
    });
  }

  private mapToEditablePermissions(permissions: UserFeaturePermission[] | null | undefined): EditableUserPermission[] {
    if (!Array.isArray(permissions)) return [];

    return permissions.map((entry) => {
      const first = Array.isArray(entry.permissions) && entry.permissions.length > 0 ? entry.permissions[0] : null;
      return {
        featureId: entry.featureId,
        featureName: entry.featureName,
        isCreate: !!first?.isCreate,
        isRead: !!first?.isRead,
        isDelete: !!first?.isDelete
      };
    });
  }

  private collectPermissionKeywords(permissions: UserFeaturePermission[] | null | undefined): string {
    if (!Array.isArray(permissions)) return '';

    return permissions
      .map((entry) => {
        const first = Array.isArray(entry.permissions) && entry.permissions.length > 0 ? entry.permissions[0] : null;
        const actions: string[] = [];
        if (first?.isCreate) actions.push('create');
        if (first?.isRead) actions.push('read');
        if (first?.isDelete) actions.push('delete');
        return `${entry.featureName} ${actions.join(' ')}`;
      })
      .join(' ');
  }

  private saveSelectedUserPermissions(ctx?: DialogActionContext, onSuccess?: () => void): void {
    if (!this.selectedUser || this.isSavingPermissions || !this.hasPermissionChanges) return;

    this.isSavingPermissions = true;
    ctx?.startLoading();

    const body = {
      userId: this.selectedUser.userId,
      featurePermissions: this.selectedUserPermissions.map((permission) => ({
        featureId: permission.featureId,
        featureName: permission.featureName.toUpperCase(),
        permissions: [{
          isCreate: permission.isCreate,
          isDelete: permission.isDelete,
          isRead: permission.isRead
        }]
      }))
    };

    this.api.manageUserPermissions(body).subscribe({
      next: (res) => {
        this.isSavingPermissions = false;
        ctx?.stopLoading();
        if (!res?.isSuccess) {
          this.notify.show(res?.message || 'Failed to update user permissions', 'Close', 6000);
          return;
        }

        this.syncSelectedUserPermissionsToDataSource();
        this.initialSelectedUserPermissions = this.cloneEditablePermissions(this.selectedUserPermissions);
        this.notify.show(res?.message || 'User permissions updated successfully');
        onSuccess?.();
      },
      error: (err) => {
        this.isSavingPermissions = false;
        ctx?.stopLoading();
        this.notify.show(
          err?.userMessage ?? err?.error?.message ?? 'Failed to update user permissions',
          'Close',
          6000
        );
      }
    });
  }

  private syncSelectedUserPermissionsToDataSource(): void {
    if (!this.selectedUser) return;

    const nextPermissions: UserFeaturePermission[] = this.selectedUserPermissions.map((permission) => ({
      featureId: permission.featureId,
      featureName: permission.featureName,
      permissions: [{
        isCreate: permission.isCreate,
        isDelete: permission.isDelete,
        isRead: permission.isRead
      }]
    }));

    this.selectedUser.permissions = nextPermissions;

    const index = this.dataSource.data.findIndex((user) => user.userId === this.selectedUser?.userId);
    if (index === -1) return;

    const updated = [...this.dataSource.data];
    updated[index] = {
      ...updated[index],
      permissions: nextPermissions
    };
    this.dataSource.data = updated;
  }

  private cloneEditablePermissions(source: EditableUserPermission[]): EditableUserPermission[] {
    return source.map((permission) => ({ ...permission }));
  }
}
