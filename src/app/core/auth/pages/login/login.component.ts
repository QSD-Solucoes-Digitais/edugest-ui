import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    login: ['', [Validators.required]],
    senha: ['', [Validators.required]],
  });

  erro = signal<string | null>(null);
  carregando = signal(false);

  entrar(): void {
    if (this.form.invalid) return;
    const { login, senha } = this.form.getRawValue();
    this.erro.set(null);
    this.carregando.set(true);
    this.auth.login(login!, senha!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.erro.set('Login ou senha inválidos.');
        this.carregando.set(false);
      },
    });
  }
}