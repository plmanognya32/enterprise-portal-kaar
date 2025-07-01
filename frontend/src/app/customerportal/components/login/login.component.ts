import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      customerId: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert("Credentials Invalid");
      return;
    }

    this.isLoading = true;
    this.loginMessage = '';

    this.loginService.login(this.loginForm.value).then(response => {

      if (response.success) {
        console.log('Login Success ✅');
        // localStorage.setItem('sap_session', JSON.stringify(response));
        this.loginService.isAuthenticated = true;
        localStorage.setItem("customer-id", this.loginForm.get("customerId")?.value);
        this.router.navigate(['/customer/dashboard']);
      } else {
        console.log(response);
        console.log('Authentication failed❌');
      }
      // Navigate to dashboard, toast message, whatever
    })
      .catch(error => {
        console.error('Login Failed ❌', error);
      });
  }
}