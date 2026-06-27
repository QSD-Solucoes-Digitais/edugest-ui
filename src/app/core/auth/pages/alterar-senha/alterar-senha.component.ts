import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CampoErroMensagemPipe } from '../../../../shared/pipes/campo-erro-mensagem.pipe';
import { MSG } from '../../../../shared/constants/messages';

function validarSenhasGrupo(group: AbstractControl): ValidationErrors | null {
  const atual = (group.get('senhaAtual')?.value as string) ?? '';
  const nova = (group.get('novaSenha')?.value as string) ?? '';
  const confirmar = (group.get('confirmarSenha')?.value as string) ?? '';
  const errors: ValidationErrors = {};
  if (nova && atual && nova === atual) errors['novaIgualAtual'] = true;
  if (nova && confirmar && nova !== confirmar) errors['senhasNaoConferem'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgClass, ButtonModule, MessageModule, PasswordModule, ToastModule, CampoErroMensagemPipe],
  templateUrl: './alterar-senha.component.html',
  styleUrl: './alterar-senha.component.scss',
})
export class AlterarSenhaComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private formErrorService = inject(FormErrorService);

  senhaProvisoria = this.auth.senhaEhProvisoria();
  carregando = signal(false);

  form = this.fb.group(
    {
      senhaAtual: ['', Validators.required],
      novaSenha: ['', Validators.required],
      confirmarSenha: ['', Validators.required],
    },
    { validators: validarSenhasGrupo }
  );

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
  temLetra = computed(() => /[a-zA-Z]/.test(this.novaSenhaChanges()));
  temNumero = computed(() => /[0-9]/.test(this.novaSenhaChanges()));

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

  get senhaAtualControl() { return this.form.get('senhaAtual')!; }
  get novaSenhaControl() { return this.form.get('novaSenha')!; }
  get confirmarSenhaControl() { return this.form.get('confirmarSenha')!; }

  get novaSenhaInvalida(): boolean {
    return this.novaSenhaControl.touched &&
      (this.novaSenhaControl.invalid || this.form.hasError('novaIgualAtual'));
  }

  get confirmarSenhaInvalida(): boolean {
    return this.confirmarSenhaControl.touched &&
      (this.confirmarSenhaControl.invalid || this.form.hasError('senhasNaoConferem'));
  }

  calcularForcaSenha(senha: string): 'invalida' | 'fraca' | 'media' | 'forte' {
    const temMinimo = senha.length >= 8 && /[a-zA-Z]/.test(senha) && /[0-9]/.test(senha);
    if (!temMinimo) return 'invalida';
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    const temSimbolo = /[^a-zA-Z0-9]/.test(senha);
    if (senha.length >= 12 && temMaiuscula && temMinuscula && temNumero && temSimbolo) return 'forte';
    if (senha.length >= 10 && temMaiuscula && temMinuscula && temNumero) return 'media';
    return 'fraca';
  }

  alterar(): void {
    if (this.botaoDesabilitado()) return;
    const { senhaAtual, novaSenha } = this.form.getRawValue();
    this.carregando.set(true);

    this.auth.alterarSenha(senhaAtual!, novaSenha!).subscribe({
      next: () => {
        if (this.senhaProvisoria) {
          this.auth.encerrarSessao();
          this.router.navigate(['/login'], {
            state: { mensagemSucesso: MSG.senha.alteradaProvisoria },
          });
        } else {
          this.router.navigate(['/dashboard'], {
            state: { mensagemSucesso: MSG.senha.alteradaSucesso },
          });
        }
      },
      error: (err) => {
        this.carregando.set(false);
        const mensagem = this.formErrorService.tratar(err, this.form);
        if (mensagem) {
          this.messageService.add({ severity: 'error', summary: 'Erro ao alterar senha', detail: mensagem, life: 5000 });
        }
      },
    });
  }
}
