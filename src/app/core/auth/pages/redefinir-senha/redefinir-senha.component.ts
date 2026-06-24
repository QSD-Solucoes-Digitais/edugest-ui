import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
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
  imports: [ReactiveFormsModule, RouterModule, NgClass, ButtonModule, PasswordModule, MessageModule, AuthPainelMarcaComponent],
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
      novaSenha: ['', [Validators.required, Validators.minLength(8)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: senhasIguais }
  );

  sucesso = signal(false);
  tokenInvalido = signal(false);
  carregando = signal(false);
  contagem = signal(3);

  private novaSenhaChanges = toSignal(
    this.form.get('novaSenha')!.valueChanges.pipe(
      startWith(''),
      map(v => v ?? '')
    ),
    { initialValue: '' }
  );

  private formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  forcaSenha = computed(() => this.calcularForcaSenha(this.novaSenhaChanges()));

  temMinChar = computed(() => this.novaSenhaChanges().length >= 8);
  temLetra   = computed(() => /[a-zA-Z]/.test(this.novaSenhaChanges()));
  temNumero  = computed(() => /[0-9]/.test(this.novaSenhaChanges()));

  segmento1Class = computed(() => {
    const f = this.forcaSenha();
    return ['fraca', 'media', 'forte'].includes(f) ? `ativo-${f}` : '';
  });

  segmento2Class = computed(() => {
    const f = this.forcaSenha();
    return ['media', 'forte'].includes(f) ? `ativo-${f}` : '';
  });

  segmento3Class = computed(() => (this.forcaSenha() === 'forte' ? 'ativo-forte' : ''));

  forcaLabel = computed(() => {
    const labels: Record<string, string> = {
      invalida: 'Não atende aos requisitos mínimos',
      fraca: 'Fraca',
      media: 'Média',
      forte: 'Forte',
    };
    return labels[this.forcaSenha()];
  });

  forcaLabelClass = computed(() => `label-${this.forcaSenha()}`);

  botaoDesabilitado = computed(
    () => this.formStatus() !== 'VALID' || this.forcaSenha() === 'invalida' || this.carregando()
  );

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

  calcularForcaSenha(senha: string): 'invalida' | 'fraca' | 'media' | 'forte' {
    const temMinimo = senha.length >= 8 && /[a-zA-Z]/.test(senha) && /[0-9]/.test(senha);
    if (!temMinimo) return 'invalida';
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero    = /[0-9]/.test(senha);
    const temSimbolo   = /[^a-zA-Z0-9]/.test(senha);
    if (senha.length >= 12 && temMaiuscula && temMinuscula && temNumero && temSimbolo) return 'forte';
    if (senha.length >= 10 && temMaiuscula && temMinuscula && temNumero) return 'media';
    return 'fraca';
  }

  redefinir(): void {
    if (this.botaoDesabilitado() || !this.token) return;
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
