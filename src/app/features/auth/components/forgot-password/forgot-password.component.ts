import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material/material.module';
import { AuthApiService } from '../../services/auth-api.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submitting = false;
  error: string | null = null;
  success: string | null = null;

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = null;
    this.success = null;
    const body = { email: this.form.value.email!.trim().toLowerCase() };
    this.api.forgotPassword(body).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Password reset link sent. Please check your email.';
      },
      error: () => {
        this.submitting = false;
        this.error = 'Could not send reset link';
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
