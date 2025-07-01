import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorLoginService } from '../../services/vendorlogin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  selector: 'app-vendor-login',
  templateUrl: './vendorlogin.component.html',
  styleUrls: ['./vendorlogin.component.css']
})
export class VendorLoginComponent {
  loginForm: FormGroup;
  loginMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: VendorLoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      vendorId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    console.log('Form submitted', this.loginForm.value);
    if (this.loginForm.invalid) {
      console.log('Form invalid');
      this.loginForm.markAllAsTouched();
      return;
    }

    console.log('Calling login service');
    this.loginService.login(this.loginForm.value).subscribe({
      next: (response: { success: boolean; result: 'Y' | 'N'; message: string }) => {
        console.log('Login result:', response.result);
        if (response.result === 'Y') {
          console.log('Navigating to vendor dashboard');
          localStorage.setItem('vendorId', this.loginForm.value.vendorId);
          this.router.navigate(['/vendor/dashboard']);
          console.log("your vendor id", this.loginForm.value.vendorId)
        } else {
          console.log('Login failed');
          this.loginMessage = response.message || 'Invalid credentials. Please try again. Rasiledhu anthey.';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loginMessage = err.error?.message || 'An error occurred during login. This is a sign.';
      }
    });
  }
}