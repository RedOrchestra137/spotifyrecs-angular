import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

appConfig.providers.push(provideAnimations());
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
