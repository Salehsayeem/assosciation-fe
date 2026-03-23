import { Injectable, inject, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GenericDialogComponent, GenericDialogConfig, DialogButton } from '../components/generic-dialog/generic-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);

  /**
   * Open a generic dialog with custom configuration
   */
  open(config: GenericDialogConfig): MatDialogRef<GenericDialogComponent> {
    return this.dialog.open(GenericDialogComponent, {
      width: config.width || '500px',
      disableClose: config.disableClose || false,
      data: config
    });
  }

  /**
   * Quick method to show a simple text dialog
   */
  showText(title: string, content: string, buttons?: DialogButton[]): MatDialogRef<GenericDialogComponent> {
    return this.open({
      title,
      content,
      contentType: 'text',
      buttons: buttons || [{ label: 'OK', closeDialog: true }]
    });
  }

  /**
   * Quick method to show a confirmation dialog
   */
  confirm(
    title: string, 
    message: string, 
    confirmLabel: string = 'Confirm',
    cancelLabel: string = 'Cancel'
  ): MatDialogRef<GenericDialogComponent> {
    return this.open({
      title,
      content: message,
      contentType: 'text',
      buttons: [
        { label: cancelLabel, closeDialog: true },
        { label: confirmLabel, color: 'primary', closeDialog: true }
      ],
      buttonAlign: 'end'
    });
  }

  /**
   * Quick method to show an alert dialog
   */
  alert(title: string, message: string): MatDialogRef<GenericDialogComponent> {
    return this.open({
      title,
      content: message,
      contentType: 'text',
      buttons: [{ label: 'OK', color: 'primary', closeDialog: true }]
    });
  }

  /**
   * Open dialog with template content
   */
  openWithTemplate(
    title: string, 
    template: TemplateRef<unknown>, 
    customData?: unknown,
    buttons?: DialogButton[]
  ): MatDialogRef<GenericDialogComponent> {
    return this.open({
      title,
      content: template,
      contentType: 'template',
      customData,
      buttons: buttons || [{ label: 'Close', closeDialog: true }]
    });
  }
}
