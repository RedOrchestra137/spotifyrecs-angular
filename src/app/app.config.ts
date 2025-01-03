import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptService } from '../spotify-interface/auth/auth-intercept.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(), // Use Angular's HTTP client globally
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptService,
      multi: true, // This ensures the interceptor is global
    }  
  ]
};
