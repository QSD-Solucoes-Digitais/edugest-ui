import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({ name: 'campoErroMensagem', standalone: true, pure: false })
export class CampoErroMensagemPipe implements PipeTransform {
  transform(control: AbstractControl | null): string {
    if (!control || !control.errors || !control.touched) return '';

    const e = control.errors;

    if (e['apiError'])  return e['apiError'];
    if (e['required'])  return 'Campo obrigatório';
    if (e['email'])     return 'Informe um e-mail válido';
    if (e['minlength']) return `Mínimo de ${e['minlength'].requiredLength} caracteres`;
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres`;
    if (e['pattern'])   return 'Formato inválido';
    if (e['past'])      return 'A data deve ser no passado';

    return 'Campo inválido';
  }
}