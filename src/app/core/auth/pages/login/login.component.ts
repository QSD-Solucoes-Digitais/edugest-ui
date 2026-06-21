import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  form = this.fb.group({
    login: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  erro = signal<string | null>(null);
  carregando = signal(false);

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.erro.set(null));
  }

  get loginInvalido(): boolean {
    const c = this.form.get('login')!;
    return c.invalid && c.touched;
  }

  get senhaInvalida(): boolean {
    const c = this.form.get('senha')!;
    return c.invalid && c.touched;
  }

  get erroLogin(): string {
    return this.form.get('login')!.hasError('required') ? 'Informe seu usuário' : '';
  }

  get erroSenha(): string {
    const c = this.form.get('senha')!;
    if (c.hasError('required') || c.hasError('minlength')) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }

  entrar(): void {
    if (this.form.invalid) return;
    const { login, senha } = this.form.getRawValue();
    this.erro.set(null);
    this.carregando.set(true);
    this.auth.login(login!, senha!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.erro.set('E-mail ou senha incorretos.');
        this.carregando.set(false);
      },
    });
  }
}