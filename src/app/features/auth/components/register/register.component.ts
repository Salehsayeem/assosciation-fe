import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material/material.module';
import { AuthApiService } from '../../services/auth-api.service';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  submitting = false;
  error: string | null = null;
  success: string | null = null;

  submit(): void {
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.confirmPassword) { this.error = 'Passwords do not match'; return; }
    this.submitting = true;
    this.error = null;
    this.success = null;
    const value = {
      email: this.form.value.email!.trim().toLowerCase(),
      password: this.form.value.password!.trim()
    };
    this.api.register(value).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Account created. Please sign in.';
        this.router.navigate(['/auth/login']);
      },
      error: () => { this.error = 'Registration failed'; this.submitting = false; }
    });
  }
}
