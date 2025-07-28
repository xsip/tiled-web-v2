import {Component, inject, signal} from '@angular/core';
import {RootStore} from './stores/root.store';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'tiled-webroot',
  imports: [
    TranslatePipe
  ],
  template: `
    <h1>Welcome to {{ title() |translate }}!</h1>


  `,
  styles: [],
})
export class App {
  rootStore = inject(RootStore);

  protected readonly title = signal('Tiled Web V2');
}
