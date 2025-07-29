import {Component, inject, ViewEncapsulation} from '@angular/core';
import {bounceInOut} from '@tiled-web/animations';
import {DialogStore} from '@tiled-web/stores';
import {NgTemplateOutlet} from '@angular/common';
import {Button} from '../button/button';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'tiled-web-ui-dialog',
  imports: [
    NgTemplateOutlet,
    Button,
    TranslatePipe
  ],
  template: `
    @if (dialogStore.activeDialogs().length) {


      <div
        class="absolute top-0 left-0 backdrop-blur-md bg-primary/70 text-secondary flex items-center justify-center w-full h-full">
        @for (dialog of dialogStore.activeDialogs(); track $index) {
          <div  [@bounceIn]="true" class="w-2/3 h-2/3 bg-primary-2 text-secondary flex  flex-col rounded-md p-10 drop-shadow-2xl">
            <h1 class="text-2xl">{{ dialog.title |translate }}</h1>
            <h1 class="text-xl mt-5 ml-5">{{ (dialog.description ?? '') | translate }}</h1>

            <div class="mt-5 ml-5">
              <ng-container *ngTemplateOutlet="dialog.template; context: { $implicit: {} }">
              </ng-container>
            </div>
            <div class="w-full items-end flex-1 flex justify-end">
              <tiled-web-ui-button (click)="dialog.action()" [canBeBlockedByUi]="false"><p label>Ok</p></tiled-web-ui-button>
            </div>
          </div>
        }
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styles: ``,
  animations: [
    bounceInOut('200ms', '200ms')
  ]
})
export class Dialog {
  dialogStore = inject(DialogStore)
}
