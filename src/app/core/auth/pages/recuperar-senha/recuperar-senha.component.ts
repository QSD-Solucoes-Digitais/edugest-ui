import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './recuperar-senha.component.html',
  styleUrl: './recuperar-senha.component.scss',
})
export class RecuperarSenhaComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  enviado = signal(false);
  carregando = signal(false);

  get emailInvalido(): boolean {
    const c = this.form.get('email')!;
    return c.invalid && c.touched;
  }

  enviar(): void {
    if (this.form.invalid) return;
    this.carregando.set(true);
    this.auth.recuperarSenha(this.form.getRawValue().email!).subscribe({
      next: () => this.concluir(),
      error: () => this.concluir(), // mensagem genérica — não revela se e-mail existe
    });
  }

  private concluir(): void {
    this.enviado.set(true);
    this.carregando.set(false);
  }
}