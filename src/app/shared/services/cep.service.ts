import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface EnderecoViaCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  private http = inject(HttpClient);

  buscar(cep: string): Observable<EnderecoViaCep | null> {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return of(null);

    return this.http.get<any>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      map(res =>
        res.erro
          ? null
          : {
              logradouro: res.logradouro,
              bairro:     res.bairro,
              cidade:     res.localidade,
              uf:         res.uf,
              cep:        res.cep,
            }
      ),
      catchError(() => of(null))
    );
  }
}
