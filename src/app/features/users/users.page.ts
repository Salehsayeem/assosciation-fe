import { Component, ViewChild, AfterViewInit, OnInit, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FeatureApiService } from '../feature-api';
import { GetAllUsersResponse, UserListItem } from '../../core/models/response/user.response';
import { Role } from '../../core/models/response/role.response';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../core/components/base.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { GenericDialogComponent } from '../../shared/components/generic-dialog/generic-dialog.component';
import { DialogActionContext } from '../../shared/components/generic-dialog/generic-dialog.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { v4 as uuidv4 } from 'uuid';
import { MatOption } from "@angular/material/select";
import { TableStateService } from '../../shared/services/table-state.service';
@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, ReactiveFormsModule, RelativeTimePipe, MatOption],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss']
})
export class UsersPageComponent extends BaseComponent implements OnInit, AfterViewInit {
  private readonly api = inject(FeatureApiService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly tableState = inject(TableStateService);

  displayedColumns = ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'status', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<UserListItem>([]);
  isLoading = true;
  error: string | null = null;
  roles: Role[] = [];
  rolesLoading = false;
  statuses: string[] = [];

  // Edit mode state
  editMode = false;
  currentUserDetails: any = null;
  featureList: string[] = [];
  private readonly editableFields = ['email', 'firstName', 'lastName', 'phoneNumber', 'status'] as const;
  // Case-insensitive comparison for status select
  compareStatus = (a: string | null, b: string | null): boolean => {
    return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
  };

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

  @ViewChild('userDetailsTemplate') userDetailsTemplate!: TemplateRef<any>;
  @ViewChild('editUserTemplate') editUserTemplate!: TemplateRef<any>;
  @ViewChild('addUserTemplate') addUserTemplate!: TemplateRef<any>;
  @ViewChild('deleteUserTemplate') deleteUserTemplate!: TemplateRef<any>;

  addForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    roleId: [''],
    firstName: [''],
    lastName: [''],
    phoneNumber: ['', [Validators.minLength(10)]]
  });

  editForm = this.fb.group({
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    username: [{ value: '', disabled: true }],
    status: [{ value: '', disabled: true }, [Validators.required]],
    emailVerified: [{ value: false, disabled: true }],
    phoneVerified: [{ value: false, disabled: true }],
    roles: [{ value: '', disabled: true }],
    firstName: [{ value: '', disabled: true }],
    lastName: [{ value: '', disabled: true }],
    roleId: [{ value: '', disabled: true }],
    phoneNumber: [{ value: '', disabled: true }, [Validators.minLength(10)]]
  });

  ngAfterViewInit(): void {
    this.tableState.bindControls(this.dataSource, this.tablePaginator, this.tableSort);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadStatuses();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.api.getAllUsers().subscribe({
      next: (res: GetAllUsersResponse) => {
        this.runInZone(() => {
          if (res.isSuccess) {
            this.dataSource.data = res.data as UserListItem[];
            this.error = null;
          } else {
            this.error = res.message || 'Failed to load users';
          }
          this.isLoading = false;
          this.markForCheck();
        });
      },
      error: () => {
        this.runInZone(() => {
          this.error = 'Failed to load users';
          this.isLoading = false;
          this.markForCheck();
        });
      }
    });
  }

  private loadRoles(): void {
    this.rolesLoading = true;
    this.api.getAllRoles().subscribe({
      next: (res) => {
        this.runInZone(() => {
          this.roles = res?.data ?? [];
          this.rolesLoading = false;
          this.markForCheck();
        });
      },
      error: () => {
        this.runInZone(() => {
          this.roles = [];
          this.rolesLoading = false;
          this.markForCheck();
        });
      }
    });
  }

  private loadStatuses(): void {
    this.api.getUserStatuses().subscribe({
      next: (res) => {
        this.runInZone(() => {
          this.statuses = Array.isArray(res) ? res : [];
          this.markForCheck();
        });
      },
      error: () => {
        this.runInZone(() => {
          this.statuses = [];
          this.markForCheck();
        });
      }
    });
  }

  openAddUserDialog(): void {
    this.resetAddDialogState();

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '720px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Add New User',
        content: this.addUserTemplate,
        contentType: 'template',
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Save',
            icon: 'save',
            color: 'primary',
            action: (ctx: DialogActionContext) => {
                  if (this.addForm.invalid) {
                    this.addForm.markAllAsTouched();
                    return;
                  }
              ctx.startLoading();
              const v = this.addForm.getRawValue();
              const appIdStr = this.auth.user()?.applicationId;
              const applicationId = appIdStr ? parseInt(appIdStr, 10) : 0;
              const userId = crypto.randomUUID ? crypto.randomUUID() : uuidv4();

              const payload = {
                userId,
                email: v.email ?? '',
                applicationId,
                firstName: v.firstName ?? '',
                lastName: v.lastName ?? '',
                roleId: v.roleId ?? '',
                phoneNumber: v.phoneNumber ?? ''
              };

              this.api.createUser(payload).subscribe({
                next: () => {
                  ctx.stopLoading();
                  this.notify.show('User created successfully');
                  const newUser: UserListItem = {
                    userId,
                    username: payload.email,
                    email: payload.email,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    status: 'active',
                    updatedAt: new Date().toISOString()
                  };
                  this.runInZone(() => {
                    this.dataSource.data = [...this.dataSource.data, newUser];
                    this.markForCheck();
                  });
                  ref.close();
                },
                error: () => {
                  ctx.stopLoading();
                  this.notify.show('Failed to create user');
                }
              });
            }
          }
        ]
      }
    });

    ref.afterClosed().subscribe(() => {
      this.resetAddDialogState();
    });
  }

  // No longer used; edit handled via GenericDialog in onEditUser

  openDeleteUserDialog(user: UserListItem): void {
    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '600px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Delete User',
        content: this.deleteUserTemplate,
        contentType: 'template',
        customData: user,
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Delete',
            icon: 'delete',
            color: 'warn',
            action: (ctx: DialogActionContext) => {
              ctx.startLoading();
              this.api.removeUser(user.userId).subscribe({
                next: (res) => {
                  ctx.stopLoading();
                  // Consider success if explicit flag true or no error returned
                  const isOk = res?.isSuccess === true || res === true || res == null;
                  if (!isOk) {
                    this.notify.show('Failed to delete user');
                    return;
                  }
                  const updated = this.dataSource.data.filter(u => u.userId !== user.userId);
                  this.runInZone(() => {
                    this.dataSource.data = updated;
                    this.markForCheck();
                  });
                  this.notify.show('User deleted');
                  ref.close();
                },
                error: () => {
                  ctx.stopLoading();
                  this.notify.show('Failed to delete user');
                }
              });
            }
          }
        ]
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tableState.applyFilter(this.dataSource, value);
  }

  onEditUser(user: UserListItem): void {
    if (!this.auth.hasPermission('MEMBER MANAGEMENT', 'READ')) {
      this.notify.show('You do not have permission to view user details.');
      return;
    }
    this.api.getUserDetails(user.userId).subscribe({
      next: (response) => {
        if (!response.isSuccess) return;

        this.currentUserDetails = response.data;
        this.setEditMode(false);

        // Parse and prepare feature permissions for display
        try {
          this.currentUserDetails.featurePermissionsParsed = this.parseFeaturePermissions(response.data?.featurePermissions);
        } catch {}
        this.featureList = this.buildFeatureList(response.data);

        // Prefill form with all data
        this.editForm.patchValue({
          email: response.data.email ?? '',
          username: response.data.username ?? '',
          status: this.normalizeStatus(response.data.status),
          emailVerified: response.data.emailVerified ?? false,
          phoneVerified: response.data.phoneVerified ?? false,
          roles: response.data.roles ?? '',
          firstName: response.data.firstName ?? '',
          lastName: response.data.lastName ?? '',
          roleId: '',
          phoneNumber: response.data.phoneNumber ?? ''
        });

        // All fields start disabled

        const ref = this.dialog.open(GenericDialogComponent, {
          width: '100%',
          maxWidth: '720px',
          panelClass: 'bottom-drawer',
          position: { bottom: '0' },
          disableClose: true,
          data: {
            title: 'Edit User',
            content: this.editUserTemplate,
            contentType: 'template',
            customData: response.data,
            buttons: [
              { label: 'Cancel', icon: 'close', closeDialog: true },
              {
                label: 'Save',
                icon: 'save',
                color: 'primary',
                action: (ctx: DialogActionContext) => {
                  if (this.editForm.invalid) {
                    this.editForm.markAllAsTouched();
                    return;
                  }
                  ctx.startLoading();
                  const v = this.editForm.getRawValue();
                  const appId = this.auth.user()?.applicationId;
                  const body = {
                    userId: response.data.userId,
                    email: v.email ?? '',
                    applicationId: appId ? parseInt(appId) : 1,
                    firstName: v.firstName ?? '',
                    lastName: v.lastName ?? '',
                    roleId: uuidv4(),
                    phoneNumber: v.phoneNumber ?? '',
                    status: v.status ?? ''
                  };
                  this.api.updateUser(body).subscribe({
                    next: () => {
                      ctx.stopLoading();
                      this.notify.show('User updated successfully');
                      const idx = this.dataSource.data.findIndex(u => u.userId === user.userId);
                      if (idx > -1) {
                        const updated = [...this.dataSource.data];
                        updated[idx] = {
                          ...updated[idx],
                          email: body.email,
                          firstName: body.firstName,
                          lastName: body.lastName,
                          phoneNumber: body.phoneNumber,
                          status: body.status,
                          updatedAt: new Date().toISOString()
                        };
                        this.runInZone(() => {
                          this.dataSource.data = updated;
                          this.markForCheck();
                        });
                      }
                      ref.close();
                    },
                    error: (err) => {
                      ctx.stopLoading();
                      console.error('UpdateUser error', err);
                      this.notify.show('Failed to update user');
                    }
                  });
                }
              }
            ]
          }
        });

        ref.afterClosed().subscribe(() => {
          this.resetEditDialogState();
        });
      },
      error: () => {
        this.notify.show('Failed to load user details');
      }
    });
  }

  toggleEditMode(): void {
    this.setEditMode(!this.editMode);
  }

  private setEditMode(enabled: boolean): void {
    this.editMode = enabled;
    this.editableFields.forEach(field => {
      const control = this.editForm.get(field);
      if (enabled) {
        control?.enable();
      } else {
        control?.disable();
      }
    });
  }

  private resetEditDialogState(): void {
    this.setEditMode(false);
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    Object.values(this.editForm.controls).forEach(control => {
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  private resetAddDialogState(): void {
    const defaultRole = this.roles[0]?.roleId ?? '';
    this.addForm.reset({
      email: '',
      roleId: defaultRole,
      firstName: '',
      lastName: '',
      phoneNumber: ''
    });
    this.addForm.markAsPristine();
    this.addForm.markAsUntouched();
    Object.values(this.addForm.controls).forEach(control => {
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  private parseFeaturePermissions(raw: any): Array<{ name: string; permissions: string[] }> {
    if (!raw) {
      return [];
    }

    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.entries(obj).map(([name, value]: [string, any]) => {
          const perms = Array.isArray(value?.permissions) ? value.permissions : [];
          return { name, permissions: perms.map((p: string) => p.toUpperCase()) };
        });
      }
    } catch (error) {
      console.warn('Unable to parse featurePermissions', error);
    }

    return [];
  }

  hasPermission(user: any, feature: string, action: string): boolean {
    if (!user) {
      return false;
    }

    if (Array.isArray(user.featurePermissionsParsed)) {
      const match = user.featurePermissionsParsed.find((f: any) => f.name?.toUpperCase() === feature.toUpperCase());
      if (match) {
        return match.permissions?.some((perm: string) => perm.toUpperCase() === action.toUpperCase()) ?? false;
      }
    }

    // Fallback to legacy token parsing if needed
    if (!user.featurePermissions) {
      return false;
    }

    const tokens = Array.isArray(user.featurePermissions)
      ? user.featurePermissions
      : String(user.featurePermissions)
          .split(/[,;\s]+/)
          .map(token => token.trim())
          .filter(Boolean);

    const target = `${feature}_${action}`.toUpperCase();
    return tokens.some((token: string) => token.toUpperCase() === target || token.toUpperCase().includes(target));
  }

  private buildFeatureList(user: any): string[] {
    // Try parsed structure first
    const parsed = this.parseFeaturePermissions(user?.featurePermissions);
    if (parsed.length) {
      return parsed.map(p => p.name).filter(Boolean);
    }

    // Fallback: derive features from tokenized permissions like "FEATURE_ACTION"
    const raw = user?.featurePermissions;
    if (!raw) return [];

    const tokens = Array.isArray(raw)
      ? raw
      : String(raw)
          .split(/[,;\s]+/)
          .map((t: string) => t.trim())
          .filter(Boolean);

    const names = new Set<string>();
    tokens.forEach((token: string) => {
      const up = token.toUpperCase();
      const idx = up.lastIndexOf('_');
      if (idx > 0) {
        const feature = up.slice(0, idx).replace(/_/g, ' ').trim();
        if (feature) names.add(feature);
      }
    });

    return Array.from(names);
  }

  private normalizeStatus(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v) return '';
    // Try to match one of the loaded statuses ignoring case
    const match = this.statuses.find(s => s.toLowerCase() === v.toLowerCase());
    if (match) return match;
    // Fallback: capitalize first letter, lower-case the rest
    return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  }
}
