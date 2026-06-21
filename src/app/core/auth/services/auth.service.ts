import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated = signal(true);

  isAuthenticated() {
    return this._authenticated();
  }

  logout() {
    this._authenticated.set(false);
  }
}
