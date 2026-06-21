import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import {errorInterceptor} from './core/http/interceptors/error.interceptor';
import {authInterceptor} from './core/http/interceptors/auth.interceptor';
import {loadingInterceptor} from './core/http/interceptors/loading.interceptor';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}'
    },
    colorScheme: {
      light: {
        surface: {
          0:   '#ffffff',
          50:  '{slate.100}',
          100: '{slate.200}',
          200: '{slate.300}',
          300: '{slate.400}',
          400: '{slate.500}',
          500: '{slate.600}',
          600: '{slate.700}',
          700: '{slate.800}',
          800: '{slate.900}',
          900: '{slate.950}',
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
    MessageService,
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: { darkModeSelector: false }
      }
    })
  ]
};
