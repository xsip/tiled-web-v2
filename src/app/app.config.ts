import {
  ApplicationConfig,
  inject, provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideTranslateService, TranslateLoader, TranslateService} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {HttpClient, provideHttpClient, withFetch} from '@angular/common/http';
import {ProjectStore, RootStore} from '@tiled-web/stores';
import {setLangHelper} from '@tiled-web/ui';
import {ProjectLoader} from '@tiled-web/logic';

export const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) => {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync('animations'),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    {
      provide: 'setLanguageFn',
      useFactory: () => {
        const translateService = inject(TranslateService);
        const rootStore = inject(RootStore);
        return (lang: 'de' | 'en') => {
          setLangHelper(lang, rootStore, translateService);
        }
      },
      deps: [RootStore]
    },

    provideAppInitializer( async () => {
      const dbService = inject(ProjectLoader)
      await dbService.initDB();

    })
  ]
};
