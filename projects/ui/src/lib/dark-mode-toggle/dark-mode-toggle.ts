import {Component, inject, OnInit, Renderer2} from '@angular/core';
import {RootStore} from '@tiled-web/stores';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'tiled-web-ui-dark-mode-toggle',
  imports: [
    FormsModule
  ],
  template: `
    <div class="flex gap-5 justify-between">
      <div
        class="z-10 w-16 h-8   transition-transform duration-75 cursor-pointer"
      >
        <input
          type="checkbox"
          id="dark-mode-toggle"
          [(ngModel)]="darkMode"
          class="hidden"
          (change)="darkModeToggle(true)"
        />
        <label
          for="dark-mode-toggle"
          class="transition-all delay-0 w-full h-full bg-gray-100 dark:bg-slate-500 rounded-md p-1 flex justify-between items-center  cursor-pointer"
        >
                    <span class="inline ml-1 dark:hidden"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4 ml-1 text-slate-600 dark:text-white"
                    >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                        />
                      </svg>
                    </span>
          <span
            class="w-6 h-6 rounded-md opacity-80 bg-white dark:bg-slate-700 block float-right dark:float-left"
          ></span>
          <span class="hidden ml-1 dark:inline"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4 mr-2 dark:text-white text-white"
          >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                        />
                      </svg>
                    </span>
        </label>
      </div>
    </div>

  `,
  styles: ``
})
export class DarkModeToggle implements OnInit {
  darkMode = false;

  rootStore = inject(RootStore);

  ngOnInit() {
    this.darkMode = this.rootStore.darkModeEnabled();
    this.darkModeToggle();
  }

  renderer = inject(Renderer2);

  darkModeToggle(setInStore = false) {
    // console.log(this.darkMode);
    setInStore && this.rootStore.setDarkModeStatus(this.darkMode);
    if (this.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
