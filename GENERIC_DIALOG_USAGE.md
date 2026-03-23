# Generic Dialog Component

A flexible, reusable dialog component that can be used throughout the application.

## Features

- Dynamic title, content, buttons, and footer
- Support for text, template, or custom content
- Configurable button positions (start, center, end)
- Pre-built helper methods for common dialog types
- Global service for easy access

## Usage

### 1. Using DialogService (Recommended)

#### Simple Alert
```typescript
import { DialogService } from '@shared/services/dialog.service';

constructor(private dialogService: DialogService) {}

showAlert() {
  this.dialogService.alert('Success', 'Operation completed successfully!');
}
```

#### Confirmation Dialog
```typescript
showConfirmation() {
  const dialogRef = this.dialogService.confirm(
    'Delete User',
    'Are you sure you want to delete this user?',
    'Delete',
    'Cancel'
  );

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // User clicked Delete
    }
  });
}
```

#### Custom Text Dialog
```typescript
showCustomText() {
  this.dialogService.showText(
    'Welcome',
    'This is a custom message',
    [
      { label: 'Cancel', closeDialog: true },
      { label: 'Proceed', color: 'primary', action: () => this.proceed(), closeDialog: true }
    ]
  );
}
```

### 2. Using Template Content

```typescript
// In component.ts
@ViewChild('customTemplate') customTemplate!: TemplateRef<any>;

showTemplateDialog() {
  this.dialogService.openWithTemplate(
    'User Details',
    this.customTemplate,
    { userId: '123', name: 'John Doe' },
    [
      { label: 'Close', closeDialog: true },
      { label: 'Edit', color: 'primary', action: () => this.edit() }
    ]
  );
}
```

```html
<!-- In component.html -->
<ng-template #customTemplate let-data>
  <div>
    <p>User ID: {{ data.userId }}</p>
    <p>Name: {{ data.name }}</p>
  </div>
</ng-template>
```

### 3. Advanced Configuration

```typescript
openAdvancedDialog() {
  const dialogRef = this.dialogService.open({
    title: 'Advanced Dialog',
    content: 'This is the content',
    contentType: 'text',
    width: '700px',
    disableClose: true,
    buttons: [
      { label: 'Skip', closeDialog: true },
      { label: 'Save Draft', action: () => this.saveDraft(), disabled: false },
      { label: 'Publish', color: 'primary', action: () => this.publish(), closeDialog: true }
    ],
    buttonAlign: 'end',
    footer: 'Last saved: 2 minutes ago'
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed', result);
  });
}
```

## Configuration Options

### GenericDialogConfig

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `title` | `string` | Dialog title | Required |
| `content` | `string \| TemplateRef \| any` | Dialog content | - |
| `contentType` | `'text' \| 'template' \| 'custom'` | How to render content | `'text'` |
| `buttons` | `DialogButton[]` | Array of button configurations | `[{ label: 'Close', closeDialog: true }]` |
| `buttonAlign` | `'start' \| 'center' \| 'end'` | Button alignment | `'end'` |
| `footer` | `string \| TemplateRef` | Footer content | - |
| `width` | `string` | Dialog width | `'500px'` |
| `disableClose` | `boolean` | Disable closing on backdrop click | `false` |
| `customData` | `any` | Custom data for templates | - |

### DialogButton

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Button text |
| `color` | `'primary' \| 'accent' \| 'warn'` | Button color |
| `action` | `() => void` | Function to call on click |
| `closeDialog` | `boolean` | Close dialog after click |
| `disabled` | `boolean` | Disable button |

## Examples in Different Scenarios

### Delete Confirmation
```typescript
deleteUser(user: User) {
  const ref = this.dialogService.confirm(
    'Delete User',
    `Are you sure you want to delete ${user.username}?`,
    'Delete',
    'Cancel'
  );

  ref.afterClosed().subscribe(result => {
    if (result) {
      this.api.deleteUser(user.id).subscribe();
    }
  });
}
```

### Form in Dialog
```typescript
// Create a template with form
@ViewChild('formTemplate') formTemplate!: TemplateRef<any>;
formData = { name: '', email: '' };

openFormDialog() {
  this.dialogService.openWithTemplate(
    'Add User',
    this.formTemplate,
    this.formData,
    [
      { label: 'Cancel', closeDialog: true },
      { 
        label: 'Save', 
        color: 'primary', 
        action: () => this.saveForm(),
        closeDialog: true 
      }
    ]
  );
}
```

```html
<ng-template #formTemplate let-data>
  <mat-form-field>
    <input matInput [(ngModel)]="data.name" placeholder="Name">
  </mat-form-field>
  <mat-form-field>
    <input matInput [(ngModel)]="data.email" placeholder="Email">
  </mat-form-field>
</ng-template>
```

### Multi-Action Dialog
```typescript
openMultiAction() {
  this.dialogService.open({
    title: 'Choose Action',
    content: 'What would you like to do with this item?',
    contentType: 'text',
    buttons: [
      { label: 'View', color: 'primary', action: () => this.view() },
      { label: 'Edit', color: 'accent', action: () => this.edit() },
      { label: 'Delete', color: 'warn', action: () => this.delete() },
      { label: 'Cancel', closeDialog: true }
    ],
    buttonAlign: 'center'
  });
}
```
