import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthPainelMarcaComponent } from '../../components/auth-painel-marca/auth-painel-marca.component';
import { AuthService } from '../../services/auth.service';

const senhasIguais: ValidatorFn = (group: AbstractControl) => {
  const nova = group.get('novaSenha')?.value as string;
  const confirmar = group.get('confirmar')?.value as string;
  return nova && confirmar && nova !== confirmar ? { senhasDiferentes: true } : null;
};

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ButtonModule, PasswordModule, MessageModule, AuthPainelMarcaComponent],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.scss',
})
export class RedefinirSenhaComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  form = this.fb.group(
    {
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: senhasIguais }
  );

  sucesso = signal(false);
  tokenInvalido = signal(false);
  carregando = signal(false);
  contagem = signal(3);

  private token = '';
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.tokenInvalido.set(true);
  }

  get novaSenhaInvalida(): boolean {
    const c = this.form.get('novaSenha')!;
    return c.invalid && c.touched;
  }

  get confirmarInvalido(): boolean {
    const c = this.form.get('confirmar')!;
    return c.touched && this.form.hasError('senhasDiferentes');
  }

  redefinir(): void {
    if (this.form.invalid || !this.token) return;
    this.carregando.set(true);
    this.auth.redefinirSenha(this.token, this.form.getRawValue().novaSenha!).subscribe({
      next: () => {
        this.sucesso.set(true);
        this.carregando.set(false);
        this.iniciarContagem();
      },
      error: () => {
        this.tokenInvalido.set(true);
        this.carregando.set(false);
      },
    });
  }

  private iniciarContagem(): void {
    this.timer = setInterval(() => {
      this.contagem.update(n => n - 1);
      if (this.contagem() <= 0) {
        clearInterval(this.timer);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
}