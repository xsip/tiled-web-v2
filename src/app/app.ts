import { Component, signal } from '@angular/core';

@Component({
  selector: 'tw-root',
  imports: [],
  template: `
    <h1>Welcome to {{ title() }}!</h1>

    
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('tiled-web-v2');
}
