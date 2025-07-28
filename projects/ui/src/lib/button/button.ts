import {Component, input} from '@angular/core';

@Component({
  selector: 'tiled-web-ui-button',
  imports: [],
  template: `
    <button id="dropdownDefaultButton"
            class="text-white cursor-pointer {{styling()}} h-8  w-full justify-between focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center  dark:focus:ring-blue-800"
            type="button">
      <ng-content select="[label]"/>
    </button>
  `,
  styles: ``
})
export class Button {
  styling = input<string>("bg-blue-700 hover:bg-blue-800  dark:bg-blue-600 dark:hover:bg-blue-700")
}
