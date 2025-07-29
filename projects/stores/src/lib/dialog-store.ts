import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {inject, InjectionToken, TemplateRef} from '@angular/core';
import {ProjectLoader} from '@tiled-web/logic';


export type Dialog = {
  title: string;
  description?: string;
  template?: TemplateRef<any>;
  action: () => Promise<void> | void;
  isClosed?: boolean;
  id?: number;
  blocksUiInput?: boolean;
}

type DialogState = {
  dialogs: Dialog[];
};

const DIALOG_STATE = new InjectionToken<DialogState>(
  'DialogState',
  {
    factory: () => {
      const state: DialogState = {
        dialogs: []
      }
      return state;
    }
  }
);


export const DialogStore = signalStore(
  {providedIn: 'root'},
  withState(() => inject(DIALOG_STATE)),
  withComputed((store) => {
    return {
      uiBlockingDialogIsOpen() {
        return store.dialogs().find(dialog => !dialog.isClosed && dialog.blocksUiInput);
      },
      activeDialogs() {
        return store.dialogs().filter(dialog => !dialog.isClosed);
      }
    }
  }),
  withMethods((store) => {
      return ({
        async showDialog(dialog: Dialog) {
          const newDialogId = new Date().getTime();
          patchState(store, (state) => ({
            ...state,
            dialogs: [...state.dialogs, {
              ...dialog,
              id: newDialogId,
              action: async () => {
                await dialog.action();
                patchState(store, (s) => ({
                  ...s, dialogs: s.dialogs.map(d => {
                    if (d.id === newDialogId)
                      d.isClosed = true;
                    return d;
                  })
                }));
              }
            }]
          }))
        },
        hideDialog(dialogId: number) {

        }
      })
    }
  )
);
