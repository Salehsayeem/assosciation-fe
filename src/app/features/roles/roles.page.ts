import { Component, ViewChild, AfterViewInit, inject, OnInit, TemplateRef } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FeatureApiService } from '../feature-api';
import { Role } from '../../core/models/response/role.response';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../../core/components/base.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { GenericDialogComponent } from '../../shared/components/generic-dialog/generic-dialog.component';
import { DialogActionContext } from '../../shared/components/generic-dialog/generic-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { TableStateService } from '../../shared/services/table-state.service';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [RouterModule, MaterialModule, ReactiveFormsModule, RelativeTimePipe],
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss']
})
export class RolesPageComponent extends BaseComponent implements OnInit, AfterViewInit {
  private readonly api = inject(FeatureApiService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly tableState = inject(TableStateService);

  displayedColumns = ['id', 'name', 'description', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<Role>([]);
  isLoading = false;
  error: string | null = null;

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

  @ViewChild('roleDetailsTemplate') roleDetailsTemplate!: TemplateRef<any>;
  @ViewChild('editRoleTemplate') editRoleTemplate!: TemplateRef<any>;
  @ViewChild('addRoleTemplate') addRoleTemplate!: TemplateRef<any>;
  @ViewChild('deleteRoleTemplate') deleteRoleTemplate!: TemplateRef<any>;

  editForm = this.fb.group({
    roleId: [''],
    name: ['', Validators.required],
    description: ['']
  });

  addForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.tableState.bindControls(this.dataSource, this.tablePaginator, this.tableSort);
  }

  loadRoles(): void {
    this.isLoading = true;
    this.error = null;
    this.api.getAllRoles().subscribe({
      next: (response) => {
        this.runInZone(() => {
          if (response.isSuccess) {
            this.dataSource.data = response.data;
          } else {
            this.error = response.message || 'Failed to load roles';
          }
          this.isLoading = false;
          this.markForCheck();
        });
      },
      error: (error) => {
        this.runInZone(() => {
          console.error('Error loading roles:', error);
          this.error = 'Failed to load roles. Please try again.';
          this.isLoading = false;
          this.markForCheck();
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tableState.applyFilter(this.dataSource, value);
  }

  onEditRole(role: Role): void {
    if (!this.auth.hasPermission('MEMBER MANAGEMENT', 'CREATE')) {
      this.notify.show('You do not have permission to modify roles.');
      return;
    }

    this.editForm.patchValue({
      roleId: role.roleId,
      name: role.name,
      description: role.description
    });

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '600px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Edit Role',
        content: this.editRoleTemplate,
        contentType: 'template',
        customData: role,
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Save',
            icon: 'save',
            color: 'primary',
            action: (ctx: DialogActionContext) => {
              if (this.editForm.invalid) {
                Object.keys(this.editForm.controls).forEach(key => {
                  this.editForm.get(key)?.markAsTouched();
                });
                this.notify.show('Please fill in all required fields');
                return;
              }
              ctx.startLoading();
              const v = this.editForm.value;
              const appIdStr = this.auth.user()?.applicationId;
              const applicationId = appIdStr ? parseInt(appIdStr, 10) : 1;
              const body = {
                roleId: role.roleId,
                applicationId,
                name: v.name!,
                description: v.description || ''
              };
              this.api.createOrUpdateRole(body).subscribe({
                next: (res) => {
                  ctx.stopLoading();
                  this.notify.show('Role updated successfully');
                  const returned: Role | null = res?.data ?? null;
                  const index = this.dataSource.data.findIndex(r => r.roleId === role.roleId);
                  if (index !== -1) {
                    this.runInZone(() => {
                      const nowIso = new Date().toISOString();
                      this.dataSource.data[index] = {
                        ...this.dataSource.data[index],
                        ...(returned ?? { name: body.name, description: body.description }),
                        updatedAt: returned?.updatedAt ?? nowIso
                      };
                      this.dataSource.data = [...this.dataSource.data];
                      this.markForCheck();
                    });
                  }
                  ref.close();
                },
                error: (err) => {
                  ctx.stopLoading();
                  console.error('CreateOrUpdateRole update error', err);
                  this.notify.show('Failed to update role');
                }
              });
            }
          }
        ]
      }
    });
  }

  openAddRoleDialog(): void {
    if (!this.auth.hasPermission('MEMBER MANAGEMENT', 'CREATE')) {
      this.notify.show('You do not have permission to add roles.');
      return;
    }

    this.addForm.reset();

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '600px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Add Role',
        content: this.addRoleTemplate,
        contentType: 'template',
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Create',
            icon: 'add',
            color: 'primary',
            action: (ctx: DialogActionContext) => {
              if (this.addForm.invalid) {
                Object.keys(this.addForm.controls).forEach(key => {
                  this.addForm.get(key)?.markAsTouched();
                });
                this.notify.show('Please fill in all required fields');
                return;
              }
              ctx.startLoading();
              const payload = this.addForm.value;
              const roleId = uuidv4();
              const appIdStr = this.auth.user()?.applicationId;
              const applicationId = appIdStr ? parseInt(appIdStr, 10) : 1;
              const body = {
                roleId,
                applicationId,
                name: payload.name!,
                description: payload.description || ''
              };
              this.api.createOrUpdateRole(body).subscribe({
                next: (res) => {
                  ctx.stopLoading();
                  const nowIso = new Date().toISOString();
                  const returned: Role | null = res?.data ?? null;
                  const newRole: Role = returned ?? {
                    roleId,
                    applicationId,
                    name: body.name,
                    description: body.description,
                    createdAt: nowIso,
                    updatedAt: nowIso
                  };
                  this.runInZone(() => {
                    this.dataSource.data = [...this.dataSource.data, newRole];
                    this.markForCheck();
                  });
                  this.notify.show('Role created successfully');
                  ref.close();
                },
                error: (err) => {
                  ctx.stopLoading();
                  console.error('CreateOrUpdateRole error', err);
                  this.notify.show('Failed to create role');
                }
              });
            }
          }
        ]
      }
    });
  }

  openDeleteRoleDialog(role: Role): void {
    if (!this.auth.hasPermission('MEMBER MANAGEMENT', 'CREATE')) {
      this.notify.show('You do not have permission to delete roles.');
      return;
    }

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '600px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Delete Role',
        content: this.deleteRoleTemplate,
        contentType: 'template',
        customData: role,
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Delete',
            icon: 'delete',
            color: 'warn',
            action: (ctx: DialogActionContext) => {
              ctx.startLoading();
              this.api.deleteRole(role.roleId).subscribe({
                next: (res) => {
                  ctx.stopLoading();
                  const isOk = res?.isSuccess === true || res === true || res == null;
                  if (!isOk) {
                    this.notify.show('Failed to delete role');
                    return;
                  }
                  const updated = this.dataSource.data.filter(r => r.roleId !== role.roleId);
                  this.runInZone(() => {
                    this.dataSource.data = updated;
                    this.markForCheck();
                  });
                  this.notify.show('Role deleted successfully');
                  ref.close();
                },
                error: (err) => {
                  ctx.stopLoading();
                  console.error('DeleteRole error', err);
                  this.notify.show('Failed to delete role');
                }
              });
            }
          }
        ]
      }
    });
  }
}
