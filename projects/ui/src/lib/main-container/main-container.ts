import {Component, inject, OnInit, output} from '@angular/core';
import {bounceInOut, fadeInOut} from '@tiled-web/animations';
import {DarkModeToggle} from '../dark-mode-toggle/dark-mode-toggle';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {RootStore} from '@tiled-web/stores';
import {TranslatePipe} from '@ngx-translate/core';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroArrowDownCircle} from '@ng-icons/heroicons/outline';
import {DropDownMenu, DropdownOption} from '../drop-down-menu/drop-down-menu';
import {ProjectLoader} from '@tiled-web/logic';
import {Button} from '../button/button';

@Component({
  selector: 'tiled-web-ui-main-container',
  imports: [
    DarkModeToggle,
    LanguageSwitcher,
    TranslatePipe,
    NgIcon,
    DropDownMenu,
    Button
  ],
  providers: [
    provideIcons({heroArrowDownCircle})
  ],
  template: `
    <div class="w-screen  relative h-screen background-container">
      <div id="fullContainer" #element
           class="fullContainer z-[2] overflow-y-scroll w-full   mx-auto drop-shadow-2xl overflow-x-hidden no-scrollbar h-screen relative">
        <div
          class="w-full menuHeader {{rootStore.headerIsPinned() ? 'bg-gray-200/80 dark:bg-[rgba(35,35,35)]/80' : 'bg-gray-200 dark:bg-[rgba(35,35,35)]' }} transition-all ease-in-out duration-500 dark:text-white text-gray-800 h-12 md:h-14 backdrop-blur-[4px]  drop-shadow-2xl  z-[999]  sticky top-0 left-0    dark:shadow-white/80 ">
          <div class="w-full relative h-full flex justify-between items-center">
            <div class="flex gap-5 items-center">
              <a><img class="ml-2   rounded-md md:w-10 md:h-10 w-8 h-8"
                      src="images/xsip.png"/></a>
            </div>
            <div
              class="bg-primary-2 p-5 drop-shadow-md dark:drop-shadow-transparent drop-shadow-secondary/10 cursor-pointer text-secondary rounded-md hover:scale-105 transition-all ease-in-out duration-500">

              <input #fileInput class="hidden" type="file" (change)="uploadMap($event)"/>
              <p (click)="fileInput.click()">{{ 'tiledWeb.upload' |translate }}</p>
            </div>
            <div class="flex gap-2 items-center mr-5">
              <a href="https://github.com/xsip/tiled-web-v2" target="_blank" class="transition-all ease-in duration-200 cursor-pointer hover:scale-105">
                <img src="images/github-mark.svg" class="w-8 block dark:hidden"/>
                <img src="images/github-mark-white.svg" class="w-8 hidden dark:block"/>
              </a>

              <tiled-web-ui-dark-mode-toggle/>
              <tiled-web-ui-language-switcher/>
              <tiled-web-ui-drop-down-menu [title]="'Saved Projects'" [options]="dropDownOptions">
                <p label class="text-white">{{ 'tiledWeb.savedProjects' |translate }}</p>
              </tiled-web-ui-drop-down-menu>
              <tiled-web-ui-button (click)="closeAndDeleteProject()" [styling]="'bg-red-700 hover:bg-red-800  dark:bg-red-600 dark:hover:bg-red-700'">
                <p label class="text-white">{{ 'tiledWeb.closeProject' |translate }}</p>
              </tiled-web-ui-button>
              <tiled-web-ui-button (click)="_saveProjectAs()" [styling]="'bg-green-700 hover:bg-green-800  dark:bg-green-600 dark:hover:bg-green-700'">
                <p label class="text-white">{{ 'tiledWeb.saveProject' |translate }}</p>
              </tiled-web-ui-button>
            </div>
            <!--div class="progress-container w-full absolute bottom-0 h-2 z-[999]">
              <div class="progress-bar bg-gray-800" id="myBar"></div>
            </div!-->
          </div>
          <!--<xsip-icon-auto-scroll-list>

          </xsip-icon-auto-scroll-list>!-->

        </div>
        <div
          class="md:h-[calc(100vh-3.5rem)] routerContainer relative  transition-all duration-300 ease-in-out  h-[calc(100vh-3rem)] relative ">
          <ng-content select="[body]"/>

        </div>
        <!--
        <xsip-wave class="fixed bottom-0 left-0 w-full overflow-hidden" [fullWidth]="true"></xsip-wave>
        !-->
      </div>

    </div>
    @if (rootStore.mobileMenuOpen()) {
      <div [@fadeInOut]="true"
           class="w-full z-[9999999] pt-10 pl-5 absolute top-0 left-0 bg-gray-100 dark:bg-[rgba(35,35,35,0.95)] md:h-[calc(100vh-3.5rem)] h-[calc(100vh-3rem)]   md:mt-[3.5rem] mt-[3rem]  md:hidden flex flex-col gap-5 ">

        <!--<xsip-mobile-menu/>!-->
      </div>
    }
    @if (rootStore.headerIsPinned()) {


      <div
        @fadeInOut
        class="w-full z-[99999] pointer-events-none absolute dark:text-white text-gray-800  bottom-2 left-0 flex items-center justify-center">
        <div
          class="pointer-events-auto py-2 px-4 items-center flex">
          <div class="flex md:flex-row flex-col gap-2 md:py-0 py-1 h-full">
            <!--  <div (click)="element.scrollTo({top: 0, left: 0, behavior: 'smooth'})"
                   class="md:opacity-50 opacity-100 hover:opacity-100  transition-all text-white px-3 ease-in-out duration-500 hover:scale-110 cursor-pointer bg-green-800 py-1 flex items-center justify-center rounded-md">
                <ng-icon [name]="'heroArrowDownCircle'" class="z-[3] animate-pulse duration-500" [size]="'20px'"/>
                <p>Next page</p>
              </div>!-->
            <div (click)="element.scrollTo({top: 0, left: 0, behavior: 'smooth'})"
                 class="md:opacity-50 opacity-100 hover:opacity-100  transition-all text-white px-3 ease-in-out duration-500 hover:scale-110 cursor-pointer bg-red-800 py-1 flex items-center justify-center rounded-md">
              <ng-icon [name]="'heroArrowDownCircle'" class="z-[3] rotate-180 animate-pulse duration-500"
                       [size]="'20px'"/>
              <p>{{ 'buttons.toTop' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .initial {
      display: initial;
    }
  `],
  animations: [
    fadeInOut('150ms', '150ms'),
    bounceInOut()
  ]
})
export class MainContainer implements OnInit {
  rootStore = inject(RootStore);
  projectUpload = output<File>();
  projectClosed = output<void>();
  saveProjectAs = output<void>();
  projectLoader = inject(ProjectLoader);

  dropDownOptions: DropdownOption[] = [

  ]

  uploadMap(event: any): void {
    this.projectUpload.emit(event.target.files.item(0));
  }

  async  ngOnInit() {
    const binaries = await this.projectLoader.listAllBinaries();
    for(const binary of binaries) {
      this.dropDownOptions.push({
        text: binary.key,
        display(){
          return true;
        },
        click() {

        },
        value: binary.key,
        additionalItemClass() {
          return ''
        }
      })
    }
    console.log(this.dropDownOptions);
  }

  async closeAndDeleteProject() {
    return this.projectLoader.deleteBinary('active').then(() => {
      this.projectClosed.emit();
    })
  }

  _saveProjectAs() {
    this.saveProjectAs.emit();
  }



}
