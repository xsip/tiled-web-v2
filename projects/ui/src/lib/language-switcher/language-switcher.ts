import {Component, Inject, inject, OnInit, Optional} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DropDownMenu, DropdownOption} from '../drop-down-menu/drop-down-menu';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroLanguage} from '@ng-icons/heroicons/outline';

export function setLangHelper<T extends {
  setLanguage: (l: 'de' | 'en') => void
}>(language: 'de' | 'en', rootStore: T, translateService: TranslateService) {
  translateService.use(language);
  rootStore.setLanguage(language);
}

@Component({
  selector: 'tiled-web-ui-language-switcher',
  imports: [
    DropDownMenu,
    NgIcon
  ],
  providers: [
    provideIcons({heroLanguage}),
  ],
  template: `
    <tiled-web-ui-drop-down-menu [selectedValue]="translateService.currentLang" [options]="dropDownOptions">
      <ng-icon label name="heroLanguage" />
    </tiled-web-ui-drop-down-menu>
  `,
  styles: ``
})
export class LanguageSwitcher implements OnInit {
  showLanguageMenu = false;
  translateService = inject(TranslateService);

  constructor(@Optional() @Inject('setLanguageFn') private setLanguageFn: (language: 'de' | 'en') => void) {
  }

  dropDownOptions: DropdownOption[] = [
    {
      text: 'languageSwitcher.english',
      display: () => true,
      click: () => {
        this.setLanguage('en')
      },
      value: 'en',
      additionalItemClass: () => this.translateService.currentLang === 'en' ? 'bg-primary!' : ''
    },
    {
      text: 'languageSwitcher.german',
      display: () => true,
      click: () => {
        this.setLanguage('de')
      },
      value: 'de',
      additionalItemClass: () => this.translateService.currentLang === 'de' ? 'bg-primary!' : ''
    },
  ]

  ngOnInit() {
  }

  setLanguage(lang: 'de' | 'en') {
    this.setLanguageFn(lang);
    this.showLanguageMenu = false;
  }
}
