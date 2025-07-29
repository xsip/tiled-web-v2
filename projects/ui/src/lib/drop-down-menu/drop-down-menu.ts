import {Component, ElementRef, HostListener, inject, input, viewChild} from '@angular/core';
import {bounceInOut, fadeInOut} from '@tiled-web/animations';
import {TranslatePipe} from '@ngx-translate/core';
import {DialogStore} from '@tiled-web/stores';

export interface DropdownOption {
  text: string,
  display?: () => boolean,
  click: () => void;
  additionalItemClass?: () => string;
  value?: string
}

@Component({
  selector: 'tiled-web-ui-drop-down-menu',
  imports: [
    TranslatePipe
  ],
  template: `

    <div #container class="relative w-full">
      <button (click)="!dialogStore.uiBlockingDialogIsOpen()  && (showMenu = !showMenu)" id="dropdownDefaultButton"
              class="text-white cursor-pointer h-8  w-full justify-between {{canBeBlockedByUi() && dialogStore.uiBlockingDialogIsOpen() ? 'bg-gray-700! dark:bg-gray-800! cursor-default!' : '' }} bg-blue-700 hover:bg-blue-800 focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button">
        <ng-content select="[label]"/>
        @if(showArrow()) {
          <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        }
      </button>

      @if (showMenu) {
        <!-- Dropdown menu -->
        <div [@bounceIn]="true" id="dropdown"
             class="transition-all mt-1.5  ease-in-out duration-500 top-10 left-0 absolute z-10 bg-primary-2  w-full divide-y divide-gray-100 rounded-lg shadow">
          <ul class="py-2 text-sm text-secondary" aria-labelledby="dropdownDefaultButton">
            @for (option of options(); track option) {
              @if (option.display?.() ?? true) {
                <li>
                  <a (click)="option.click(); showMenu = false;"
                     [class.bg-primary-2]="selectedValue() && selectedValue() === option.value"
                     class="cursor-pointer block px-4 py-2  {{option.additionalItemClass ?  option.additionalItemClass() : ''}} hover:bg-primary/40 ">{{ option.text     | translate }}</a>

                </li>
              }
            }
          </ul>
        </div>
      }
    </div>`,
  styles: [``],
  animations: [bounceInOut('0.2s', '0.2s'),fadeInOut('200ms', '100ms'),],

})
export class DropDownMenu {
  showMenu = false;
  dialogStore = inject(DialogStore);
  canBeBlockedByUi = input<boolean>(true);

  container = viewChild<ElementRef<HTMLDivElement>>('container');
  options = input<DropdownOption[]>([])
  selectedValue = input<string>('');
  showArrow = input<boolean>(true);
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
    if (
      !this.container()?.nativeElement?.contains(event.target)
    ) {
      this.showMenu = false;
    }
  }
}
