import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeLoginService } from '../../services/login.service';

interface LoginResponse {
  success: boolean;
  message: string;
  sapError?: any;
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  selector: 'app-login',
  templateUrl: './employeelogin.component.html',
  styleUrls: ['./employeelogin.component.css']
})
export class EmployeeLoginComponent {
  employeeLoginForm: FormGroup;
  loginMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private employeeLoginService: EmployeeLoginService,
    private router: Router
  ) {
    this.employeeLoginForm = this.fb.group({
      employeeId: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.employeeLoginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.loginMessage = '';

    this.employeeLoginService.login(this.employeeLoginForm.value).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.employeeLoginService.isAuthenticated = true;
          localStorage.setItem('employeeId', this.employeeLoginForm.value.employeeId);
          this.router.navigate(['/employee/dashboard']);
        } else {
          this.loginMessage = response.message || 'Authentication failed';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.loginMessage = error.error?.message ||
          error.message ||
          'Failed to connect to server';
      }
    });
  }
}