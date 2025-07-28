import {Component, inject, signal} from '@angular/core';
import {RootStore} from '@tiled-web/stores';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher, MainContainer} from '@tiled-web/ui';

@Component({
  selector: 'tiled-web-root',
  imports: [
    TranslatePipe,
    LanguageSwitcher,
    MainContainer
  ],
  template: `
    <tiled-web-ui-main-container>
      <h1 class="text-black bg-red-500">Welcome to {{ title() |translate }}!</h1>
    </tiled-web-ui-main-container>
  `,
  styles: [],
})
export class App {
  rootStore = inject(RootStore);

  protected readonly title = signal('Tiled Web V2');
}
