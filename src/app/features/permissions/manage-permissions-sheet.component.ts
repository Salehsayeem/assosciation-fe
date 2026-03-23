import { Component, inject } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MaterialModule } from '../../shared/material/material.module';
import { FeatureApiService } from '../feature-api';
import { NotificationService } from '../../shared/services/notification.service';

export interface ManagePermissionsData {
  roleId: string;
  roleName: string;
  features: EditableFeature[];
  mode?: 'manage' | 'add';
}

export interface EditableFeature {
  featureId: number;
  featureName: string;
  isCreate: boolean;
  isRead: boolean;
  isDelete: boolean;
}

@Component({
  selector: 'app-manage-permissions-sheet',
  standalone: true,
  imports: [MaterialModule],
  template: `
    <div class="manage-sheet">
    
      <!-- Header -->
      <div class="sheet-header">
        <div class="header-info">
          <mat-icon class="header-icon">manage_accounts</mat-icon>
          <div>
            <h2 class="sheet-title">{{ isAddMode ? 'Add Permissions' : 'Manage Permissions' }}</h2>
            <span class="sheet-subtitle">{{ data.roleName }}</span>
          </div>
        </div>
        <button mat-icon-button (click)="close()" [disabled]="isSaving" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    
      <mat-divider></mat-divider>
    
      @if (features.length > 0) {
        <div class="bulk-actions-top">
          <button
            mat-stroked-button
            (click)="clearAllPermissions()"
            [disabled]="isSaving || !anyPermissionSelected"
            >
            <mat-icon>clear_all</mat-icon>
            Clear All
          </button>
          <button
            mat-flat-button
            color="primary"
            (click)="selectAllPermissions()"
            [disabled]="isSaving || allPermissionsSelected"
            >
            <mat-icon>select_all</mat-icon>
            Select All
          </button>
        </div>
      }
    
      @if (features.length > 0) {
        <mat-divider></mat-divider>
      }
    
      <!-- Scrollable body -->
      <div class="sheet-body">
    
        @if (features.length === 0) {
          <p class="empty-msg">
            No feature permissions found for this role.
          </p>
        }
    
    
    
        @if (features.length > 0) {
          <table class="features-table">
            <thead>
              <tr>
                <th class="col-feature">Feature</th>
                <th class="col-perm">Create</th>
                <th class="col-perm">Read</th>
                <th class="col-perm">Delete</th>
              </tr>
            </thead>
            <tbody>
              @for (f of features; track f; let even = $even) {
                <tr [class.row-even]="even">
                  <td class="cell-feature">{{ f.featureName }}</td>
                  <td class="cell-perm">
                    <mat-checkbox
                      color="primary"
                      [checked]="f.isCreate"
                      [disabled]="isSaving"
                      (change)="onPermissionCheckboxChange(f, 'isCreate', $event.checked)"
                    ></mat-checkbox>
                  </td>
                  <td class="cell-perm">
                    <mat-checkbox
                      color="primary"
                      [checked]="f.isRead"
                      [disabled]="isSaving"
                      (change)="onPermissionCheckboxChange(f, 'isRead', $event.checked)"
                    ></mat-checkbox>
                  </td>
                  <td class="cell-perm">
                    <mat-checkbox
                      color="primary"
                      [checked]="f.isDelete"
                      [disabled]="isSaving"
                      (change)="onPermissionCheckboxChange(f, 'isDelete', $event.checked)"
                    ></mat-checkbox>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
    
    
    
      </div>
    
      <mat-divider></mat-divider>
    
      <!-- Footer -->
      <div class="sheet-footer">
        <button mat-stroked-button (click)="close()" [disabled]="isSaving">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          (click)="save()"
          [disabled]="isSaving || features.length === 0"
          class="save-btn"
          >
          @if (isSaving) {
            <mat-progress-spinner
              mode="indeterminate"
              diameter="16"
              class="btn-spinner"
            ></mat-progress-spinner>
          }
          <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    
    </div>
    `,
  styles: [`
    .manage-sheet {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px 14px;
      flex-shrink: 0;

      .header-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .header-icon {
          font-size: 30px;
          width: 30px;
          height: 30px;
          color: #673ab7;
        }

        .sheet-title {
          margin: 0 0 2px;
          font-size: 18px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.87);
          line-height: 1.3;
        }

        .sheet-subtitle {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.54);
        }
      }
    }

    .sheet-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      min-height: 0;

      .empty-msg {
        text-align: center;
        color: rgba(0, 0, 0, 0.54);
        padding: 32px 0;
        font-size: 14px;
      }

      .features-table {
        width: 100%;
        border-collapse: collapse;

        thead tr {
          background: rgba(103, 58, 183, 0.06);

          th {
            padding: 10px 14px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.6);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          .col-perm {
            text-align: center;
            width: 80px;
          }
        }

        tbody tr {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          transition: background 0.15s ease;

          &:hover {
            background: rgba(103, 58, 183, 0.04);
          }

          &.row-even {
            background: rgba(0, 0, 0, 0.01);

            &:hover {
              background: rgba(103, 58, 183, 0.04);
            }
          }

          td {
            padding: 8px 14px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.87);
          }

          .cell-feature {
            font-weight: 500;
          }

          .cell-perm {
            text-align: center;
            width: 80px;
          }
        }
      }

    }

    .bulk-actions-top {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      padding: 10px 24px;
      background: rgba(103, 58, 183, 0.03);

      button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
    }

    .sheet-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 14px 24px;
      flex-shrink: 0;

      .save-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 130px;
        justify-content: center;

        .btn-spinner {
          display: inline-flex;
        }
      }
    }
  `]
})
export class ManagePermissionsSheetComponent {
  protected readonly data = inject<ManagePermissionsData>(MAT_BOTTOM_SHEET_DATA);
  private readonly sheetRef = inject(MatBottomSheetRef<ManagePermissionsSheetComponent>);
  private readonly api = inject(FeatureApiService);
  private readonly notify = inject(NotificationService);

  isSaving = false;
  readonly isAddMode = this.data.mode === 'add';

  // Deep-copy data so edits don't mutate the table rows directly
  features: EditableFeature[] = this.data.features.map(f => ({ ...f }));

  onPermissionCheckboxChange(feature: EditableFeature, key: 'isCreate' | 'isRead' | 'isDelete', checked: boolean): void {
    if (this.isSaving) return;
    feature[key] = !!checked;
  }

  get allPermissionsSelected(): boolean {
    return this.features.length > 0 && this.features.every(f => f.isCreate && f.isRead && f.isDelete);
  }

  get anyPermissionSelected(): boolean {
    return this.features.some(f => f.isCreate || f.isRead || f.isDelete);
  }

  close(): void {
    this.sheetRef.dismiss(false);
  }

  save(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    const body = {
      roleId: this.data.roleId,
      featurePermissions: this.features.map(f => ({
        featureId: f.featureId,
        featureName: f.featureName.toUpperCase(),
        permissions: [{ isCreate: f.isCreate, isDelete: f.isDelete, isRead: f.isRead }]
      }))
    };

    this.api.manageRolePermissions(body).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res?.isSuccess) {
          this.notify.show(res.message || 'Permissions updated successfully');
          this.sheetRef.dismiss(true); // signal caller to refresh
        } else {
          this.notify.show(res?.message || 'Failed to update permissions', 'Close', 6000);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.notify.show(
          err?.userMessage ?? err?.error?.message ?? 'Failed to update permissions',
          'Close',
          6000
        );
      }
    });
  }

  selectAllPermissions(): void {
    this.features = this.features.map((feature) => ({
      ...feature,
      isCreate: true,
      isRead: true,
      isDelete: true
    }));
  }

  clearAllPermissions(): void {
    this.features = this.features.map((feature) => ({
      ...feature,
      isCreate: false,
      isRead: false,
      isDelete: false
    }));
  }
}
