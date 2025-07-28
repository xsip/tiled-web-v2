import {signalStore, withMethods, withState} from '@ngrx/signals';
import {inject, InjectionToken} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';


type ProjectState = {
};

const PROJECT_STATE = new InjectionToken<ProjectState>(
  'ProjectState',
  {
    factory: () => {
      const translateService = inject(TranslateService);
      const state = {

      }
      return state;
    }
  }
);


export const ProjectStore = signalStore(
  {providedIn: 'root'},
  withState(() => inject(PROJECT_STATE)),
  withMethods((store) => {
      return ({

      })
    }
  )
);
