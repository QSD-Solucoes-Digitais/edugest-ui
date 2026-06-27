import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormErrorService {

  /**
   * Trata o erro 400 da API:
   * - Se tiver `fields`: aplica erros inline nos controles do formulário e retorna null
   * - Se tiver apenas `title`: retorna a mensagem para exibir no toast
   */
  tratar(err: any, form: FormGroup): string | null {
    const body = err?.error;

    if (!body) {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    if (body.fields && Object.keys(body.fields).length > 0) {
      this.aplicarErrosCampos(body.fields, form);
      return null;
    }

    return body.title ?? 'Ocorreu um erro inesperado. Tente novamente.';
  }

  private aplicarErrosCampos(fields: Record<string, string>, form: FormGroup): void {
    Object.entries(fields).forEach(([campo, mensagem]) => {
      const controle = form.get(campo) ?? this.buscarControleAninhado(campo, form);
      if (controle) {
        controle.setErrors({ apiError: mensagem });
        controle.markAsTouched();
      }
    });
  }

  private buscarControleAninhado(campo: string, form: FormGroup): AbstractControl | null {
    const partes = campo.split('.');
    let controle: AbstractControl | null = form;
    for (const parte of partes) {
      controle = (controle as FormGroup)?.get(parte) ?? null;
      if (!controle) return null;
    }
    return controle;
  }
}