import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material/material.module';
import { AuthApiService } from '../../services/auth-api.service';


@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);

  readonly form = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  submitting = false;
  error: string | null = null;

  submit(): void {
    if (this.form.invalid) return;
    if (this.form.value.newPassword !== this.form.value.confirmPassword) { this.error = 'Passwords do not match'; return; }
    this.submitting = true;
    const value = {
      currentPassword: this.form.value.currentPassword!.trim(),
      newPassword: this.form.value.newPassword!.trim()
    };
    this.api.changePassword(value).subscribe({
      next: () => { this.submitting = false; },
      error: () => { this.error = 'Change password failed'; this.submitting = false; }
    });
  }
}
