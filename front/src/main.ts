import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    // 👇 Ajoute les providers définis dans app.config.ts (comme le router)
    ...appConfig.providers,

    // 👇 Fournit HttpClient avec la possibilité d'ajouter des intercepteurs
    provideHttpClient(
      withInterceptors([
        // Tu peux ajouter ici un AuthInterceptor si tu veux plus tard
      ])
    )
  ]
}).catch((err) => console.error(err));
