import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {inject, InjectionToken} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';


type RootState = {
  language: string;
  darkModeEnabled: boolean;
  mobileMenuOpen: boolean;
  isInitialized: boolean;
};

const resolveCurrentLanguage = (translateService: TranslateService) => {
  const defaultLang = translateService.getDefaultLang();
  return localStorage.getItem('language') ?? (defaultLang ? defaultLang : 'en');
}
const resolveIsDarkMode = () => {
  return JSON.parse(localStorage.getItem('darkModeEnabled') ? (localStorage.getItem('darkModeEnabled') + '') : 'false');
}

const ROOT_STATE = new InjectionToken<RootState>(
  'RootState',
  {
    factory: () => {
      const translateService = inject(TranslateService);
      const state = {
        language: resolveCurrentLanguage(translateService),
        darkModeEnabled: resolveIsDarkMode(),
        mobileMenuOpen: false,
        isInitialized: true,
      }
      translateService.use(state.language);
      return state;
    }
  }
);


export const RootStore = signalStore(
  {providedIn: 'root'},
  withState(() => inject(ROOT_STATE)),
  withMethods((store) => {
      return ({
        mainContainerElement() {
          return document.getElementById('fullContainer');
        },
        headerIsPinned() {
          return (this.mainContainerElement()?.scrollTop ?? 0) > 0;
        },
        setLanguage(language: string) {
          // console.log(cookieService.get('language'));
          localStorage.setItem('language', language);
          patchState(store, (state) => ({...state, language}))
        },
        setDarkModeStatus(darkModeEnabled: boolean) {
          localStorage.setItem('darkModeEnabled', JSON.stringify(darkModeEnabled));
          patchState(store, (state) => ({...state, darkModeEnabled}))
        },
      })
    }
  )
);
