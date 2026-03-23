import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material/material.module';
import { AuthApiService } from '../../services/auth-api.service';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  token: string | null = null;
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  readonly form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Missing reset token. Please use the link from your email.';
    }
  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.submitting = true;
    this.error = null;
    this.success = null;
    const body = {
      token: this.token,
      newPassword: this.form.value.newPassword!.trim()
    };
    this.api.resetPassword(body).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Password updated. You can now sign in.';
      },
      error: () => {
        this.submitting = false;
        this.error = 'Could not reset password';
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
