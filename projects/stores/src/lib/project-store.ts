import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {inject, InjectionToken} from '@angular/core';
import {ProjectLoader} from '@tiled-web/logic';


type ProjectState = {
  openZipFileBlob: Blob | undefined;
};

const PROJECT_STATE = new InjectionToken<ProjectState>(
  'ProjectState',
  {
    factory: () => {
      const state = {
        openZipFileBlob: undefined
      }
      return state;
    }
  }
);


export const ProjectStore = signalStore(
  {providedIn: 'root'},
  withState(() => inject(PROJECT_STATE)),
  withMethods((store) => {
      const projectLoader = inject(ProjectLoader);
      return ({
        async init() {

          const activeProject = await projectLoader.getBinary('active');
          let activeProjectBlob: Blob | undefined;
          if (activeProject)
            activeProjectBlob = new Blob([activeProject], {type: 'application/octet-stream'});
          patchState(store, (state) => ({...state, openZipFileBlob: activeProjectBlob}))
        },
        async updateZipFileBlob(file: File) {
          const bytes = await file.arrayBuffer();
          if (bytes) {

            const arr = new Uint8Array(bytes);
            await projectLoader.setBinary('active', arr);
            patchState(store, (state) => ({
              ...state,
              openZipFileBlob: new Blob([arr], {type: 'application/octet-stream'})
            }))
          }
        }
      })
    }
  )
);
