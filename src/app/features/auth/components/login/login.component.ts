import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material/material.module';

import { AuthService } from '../../../../core/services/auth.service';
import { AuthApiService } from '../../services/auth-api.service';

import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  submitting = false;
  error: string | null = null;
  hidePassword = true;

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = null;
    const value = {
      email: this.form.value.email!.trim().toLowerCase(),
      password: this.form.value.password!.trim(),
      rememberMe: this.form.value.rememberMe || false,
      applicationId: environment.applicationId
    };
    this.api.login(value).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data?.token) {
          this.error = res.message || 'Invalid email or password.';
          this.submitting = false;
          return;
        }
        const token = res.data.token;
        const rememberMe = !!value.rememberMe;
        this.auth.handleLogin(token, rememberMe);
        this.submitting = false;
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.error = err?.userMessage ?? err?.error?.message ?? 'Invalid email or password.';
        this.submitting = false;
      }
    });
  }
}
