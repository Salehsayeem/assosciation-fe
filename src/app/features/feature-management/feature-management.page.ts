import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../shared/material/material.module';
import { FeatureApiService, FeatureListItem } from '../feature-api';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogActionContext, GenericDialogComponent } from '../../shared/components/generic-dialog/generic-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';
import { TableStateService } from '../../shared/services/table-state.service';

@Component({
  selector: 'app-feature-management-page',
  standalone: true,
  imports: [RouterModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './feature-management.page.html',
  styleUrls: ['./feature-management.page.scss']
})
export class FeatureManagementPageComponent implements OnInit, AfterViewInit {
  private readonly api = inject(FeatureApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableState = inject(TableStateService);

  displayedColumns = ['id', 'name', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<FeatureListItem>([]);
  isLoading = true;
  error: string | null = null;
  featureDialogEditMode = false;

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

  @ViewChild('featureFormTemplate') featureFormTemplate!: TemplateRef<any>;
  @ViewChild('featureDetailsTemplate') featureDetailsTemplate!: TemplateRef<any>;
  @ViewChild('deleteFeatureTemplate') deleteFeatureTemplate!: TemplateRef<any>;

  featureForm = this.fb.group({
    featureId: [0, Validators.required],
    name: ['', Validators.required],
    description: [''],
    status: ['Active', Validators.required]
  });

  readonly filterControl = this.fb.control({ value: '', disabled: true });

  ngOnInit(): void {
    this.filterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.tableState.applyFilter(this.dataSource, String(value ?? ''));
      });

    this.loadFeatures();
  }

  ngAfterViewInit(): void {
    this.tableState.bindControls(this.dataSource, this.tablePaginator, this.tableSort);
    // Flush view updates triggered by paginator/sort registration.
    this.cdr.detectChanges();
  }

  loadFeatures(): void {
    this.isLoading = true;
    this.filterControl.disable({ emitEvent: false });
    this.error = null;

    this.api.getFeatureList().subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.dataSource.data = Array.isArray(res.data) ? res.data : [];
        } else {
          this.error = res?.message || 'Failed to load features';
        }
        this.isLoading = false;
        this.filterControl.enable({ emitEvent: false });
      },
      error: (err) => {
        this.error = err?.userMessage ?? err?.error?.message ?? 'Failed to load features';
        this.isLoading = false;
        this.filterControl.enable({ emitEvent: false });
      }
    });
  }

  openAddFeatureDialog(): void {
    this.openFeatureFormDialog('create');
  }

  onEditFeature(row: FeatureListItem): void {
    this.openFeatureDetailsDialog(row);
  }

  openFeatureDetailsDialog(row: FeatureListItem): void {
    this.featureDialogEditMode = false;
    this.featureForm.reset({
      featureId: row.featureId,
      name: row.name,
      description: row.description,
      status: this.normalizeStatus(row.status)
    });
    this.featureForm.disable();

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '600px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Feature Details',
        content: this.featureDetailsTemplate,
        contentType: 'template',
        customData: row,
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Save',
            icon: 'save',
            color: 'primary',
            action: (ctx: DialogActionContext) => {
              if (!this.featureDialogEditMode) {
                this.notify.show('Click edit to enable updating this feature');
                return;
              }

              if (this.featureForm.invalid) {
                this.featureForm.markAllAsTouched();
                this.notify.show('Please fill in all required fields');
                return;
              }

              this.submitFeatureForm(ctx, ref, true);
            }
          }
        ]
      }
    });
  }

  private openFeatureFormDialog(mode: 'create' | 'edit', feature?: FeatureListItem): void {
    const isEdit = mode === 'edit';
    this.featureForm.reset({
      featureId: isEdit ? feature?.featureId ?? 0 : 0,
      name: isEdit ? feature?.name ?? '' : '',
      description: isEdit ? feature?.description ?? '' : '',
      status: isEdit ? this.normalizeStatus(feature?.status) : 'Active'
    });

    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '600px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: isEdit ? 'Edit Feature' : 'Add Feature',
        content: this.featureFormTemplate,
        contentType: 'template',
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: isEdit ? 'Save' : 'Create',
            icon: isEdit ? 'save' : 'add',
            color: 'primary',
            action: (ctx: DialogActionContext) => {
              if (this.featureForm.invalid) {
                this.featureForm.markAllAsTouched();
                this.notify.show('Please fill in all required fields');
                return;
              }

              this.submitFeatureForm(ctx, ref, isEdit);
            }
          }
        ]
      }
    });
  }

  toggleFeatureDialogEditMode(): void {
    this.featureDialogEditMode = !this.featureDialogEditMode;

    if (this.featureDialogEditMode) {
      this.featureForm.enable();
    } else {
      this.featureForm.disable();
    }
  }

  private submitFeatureForm(
    ctx: DialogActionContext,
    ref: MatDialogRef<GenericDialogComponent>,
    isEdit: boolean
  ): void {
    const v = this.featureForm.getRawValue();
    const body = {
      featureId: Number(v.featureId ?? 0),
      name: v.name ?? '',
      description: v.description ?? '',
      status: v.status ?? 'Active'
    };

    ctx.startLoading();
    this.api.createOrUpdateFeature(body).subscribe({
      next: (res) => {
        ctx.stopLoading();
        if (!res?.isSuccess) {
          this.notify.show(
            res?.message || (isEdit ? 'Failed to update feature' : 'Failed to create feature'),
            'Close',
            6000
          );
          return;
        }

        this.notify.show(res?.message || (isEdit ? 'Feature updated successfully' : 'Feature created successfully'));
        this.loadFeatures();
        ref.close();
      },
      error: (err) => {
        ctx.stopLoading();
        this.notify.show(
          err?.userMessage ?? err?.error?.message ?? (isEdit ? 'Failed to update feature' : 'Failed to create feature'),
          'Close',
          6000
        );
      }
    });
  }

  openDeleteFeatureDialog(row: FeatureListItem): void {
    const ref = this.dialog.open(GenericDialogComponent, {
      panelClass: 'bottom-drawer',
      width: '100%',
      maxWidth: '560px',
      position: { bottom: '0' },
      disableClose: true,
      data: {
        title: 'Delete Feature',
        content: this.deleteFeatureTemplate,
        contentType: 'template',
        customData: row,
        buttons: [
          { label: 'Cancel', icon: 'close', closeDialog: true },
          {
            label: 'Delete',
            icon: 'delete',
            color: 'warn',
            action: (ctx: DialogActionContext) => {
              ctx.startLoading();
              this.api.deleteFeature(row.featureId).subscribe({
                next: (res) => {
                  ctx.stopLoading();
                  const isOk = res?.isSuccess === true || res === true || res == null;
                  if (!isOk) {
                    this.notify.show(res?.message || 'Failed to delete feature', 'Close', 6000);
                    return;
                  }
                  this.notify.show(res?.message || 'Feature deleted successfully');
                  this.dataSource.data = this.dataSource.data.filter((f) => f.featureId !== row.featureId);
                  ref.close();
                },
                error: (err) => {
                  ctx.stopLoading();
                  this.notify.show(err?.userMessage ?? err?.error?.message ?? 'Failed to delete feature', 'Close', 6000);
                }
              });
            }
          }
        ]
      }
    });
  }

  private normalizeStatus(value: string | null | undefined): string {
    return String(value ?? '').toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
  }
}
