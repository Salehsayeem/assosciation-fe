import { Component, Inject, TemplateRef, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { Observable, finalize, isObservable } from 'rxjs';

export interface DialogActionContext {
  startLoading: () => void;
  stopLoading: () => void;
}

type DialogActionResult = void | Promise<unknown> | Observable<unknown>;

export interface DialogButton {
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  action?: (context: DialogActionContext) => DialogActionResult;
  closeDialog?: boolean;
  disabled?: boolean;
  icon?: string; // optional material icon name
  loading?: boolean;
}

interface ResolvedDialogButton extends DialogButton {
  color: 'primary' | 'accent' | 'warn' | undefined;
  closeDialog: boolean;
  disabled: boolean;
  loading: boolean;
}

export interface GenericDialogConfig {
  title: string;
  content?: string | TemplateRef<unknown> | unknown; // Can be string, template, or custom data
  contentType?: 'text' | 'template' | 'custom'; // How to render content
  buttons?: DialogButton[];
  buttonAlign?: 'start' | 'center' | 'end';
  footer?: string | TemplateRef<unknown>;
  width?: string;
  disableClose?: boolean;
  customData?: unknown; // For custom content rendering
}

@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatDialogModule],
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.scss']
})
export class GenericDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('drawerHandle', { read: ElementRef }) drawerHandle?: ElementRef;

  private startY = 0;
  private startHeight = 0;
  private isDragging = false;
  private lastY = 0;
  private containerEl: HTMLElement | null = null;
  private readonly dragMoveHandler = (e: MouseEvent | TouchEvent) => this.onDragMove(e);
  private readonly dragEndHandler = () => this.onDragEnd();
  private closing = false;
  buttons: ResolvedDialogButton[];

  constructor(
    public dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: GenericDialogConfig,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    const providedButtons = this.config.buttons?.length
      ? this.config.buttons
      : [{ label: 'Close', closeDialog: true }];

    // Normalize inputs once so template bindings stay stable during checks.
    this.config = {
      ...this.config,
      contentType: this.config.contentType || 'text',
      buttonAlign: this.config.buttonAlign || 'end'
    };

    this.buttons = providedButtons.map((button) => ({
      ...button,
      color: button.color,
      closeDialog: !!button.closeDialog,
      disabled: !!button.disabled,
      loading: !!button.loading
    }));
  }

  ngAfterViewInit(): void {
    this.setupDragResize();
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
  }

  private setupDragResize(): void {
    const handle = this.elementRef.nativeElement.querySelector('.drawer-handle') as HTMLElement | null;
    this.containerEl = this.elementRef.nativeElement.closest('.mat-mdc-dialog-container') as HTMLElement | null;
    if (!handle || !this.containerEl) return;

    handle.addEventListener('mousedown', (e) => this.onDragStart(e));
    handle.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: false });
  }

  private onDragStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.isDragging = true;
    
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    this.startY = clientY;
    this.lastY = clientY;
    
    if (this.containerEl) {
      this.startHeight = this.containerEl.offsetHeight;
      this.containerEl.style.transition = 'none';
    }

    document.addEventListener('mousemove', this.dragMoveHandler);
    document.addEventListener('touchmove', this.dragMoveHandler, { passive: false });
    document.addEventListener('mouseup', this.dragEndHandler);
    document.addEventListener('touchend', this.dragEndHandler);
  }

  private onDragMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    e.preventDefault();

    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    this.lastY = clientY;
    const deltaY = this.startY - clientY;
    const newHeight = this.startHeight + deltaY;

    if (this.containerEl) {
      const minHeight = 220;
      const maxHeight = window.innerHeight * 0.9;
      const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
      this.containerEl.style.height = `${clampedHeight}px`;
    }
  }

  private onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.removeDragListeners();

    if (this.containerEl) {
      const currentHeight = this.containerEl.offsetHeight;
      const delta = this.startY - this.lastY; // negative when pulled down
      const pulledDown = delta < -80 || currentHeight < 240;
      this.containerEl.style.transition = 'height 0.2s ease';

      if (pulledDown) {
        this.playCloseAnimation();
        return;
      }

      // Snap back within bounds
      const minHeight = 220;
      const maxHeight = window.innerHeight * 0.9;
      const clampedHeight = Math.max(minHeight, Math.min(currentHeight, maxHeight));
      this.containerEl.style.height = `${clampedHeight}px`;
    }
  }

  private removeDragListeners(): void {
    document.removeEventListener('mousemove', this.dragMoveHandler);
    document.removeEventListener('touchmove', this.dragMoveHandler);
    document.removeEventListener('mouseup', this.dragEndHandler);
    document.removeEventListener('touchend', this.dragEndHandler);
  }

  onButtonClick(button: ResolvedDialogButton, index: number): void {
    if (button.disabled || button.loading) {
      return;
    }

    const context: DialogActionContext = {
      startLoading: () => this.setButtonLoading(index, true),
      stopLoading: () => this.setButtonLoading(index, false)
    };

    if (button.action) {
      const result = button.action(context);

      if (this.isPromise(result)) {
        context.startLoading();
        result.finally(() => context.stopLoading());
        return;
      }

      if (isObservable(result)) {
        context.startLoading();
        result.pipe(finalize(() => context.stopLoading())).subscribe();
        return;
      }
    }

    if (button.closeDialog) {
      this.playCloseAnimation();
    }
  }

  private setButtonLoading(index: number, loading: boolean): void {
    // Defer updates so a sync action completion can't flip disabled state
    // within the same change-detection verification cycle.
    setTimeout(() => {
      if (!this.buttons[index] || this.buttons[index].loading === loading) {
        return;
      }
      this.buttons[index].loading = loading;
      this.cdr.markForCheck();
    });
  }

  private isPromise(value: unknown): value is Promise<unknown> {
    return !!value && typeof (value as Promise<unknown>).then === 'function';
  }

  private playCloseAnimation(): void {
    if (this.closing) return;
    this.closing = true;
    if (this.containerEl) {
      this.containerEl.classList.add('drawer-closing');
      setTimeout(() => this.dialogRef.close(), 250);
    } else {
      this.dialogRef.close();
    }
  }

  getTemplate(value: unknown): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
