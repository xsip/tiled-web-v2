import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {ProjectStore, RootStore} from '@tiled-web/stores';
import {Dialog, MainContainer} from '@tiled-web/ui';

import * as jszip from 'jszip';
import {JSZipObject} from 'jszip';
import Vector from 'vector2js';
import {TilesetExtended, TmxJson} from '@tiled-web/models';
import {CollectedMapData, ProjectLoader, TiledMapParser, TmxConverter} from '@tiled-web/logic';
import {HttpClient} from '@angular/common/http';
import {KeyboardHandlerService} from '@tiled-web/controls';
import {JsonPipe} from '@angular/common';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroEye} from '@ng-icons/heroicons/outline';
import {TiledMapParserTmx} from '../../projects/logic/src/lib/map-parser-tmx';


export function placeVectorInGrid(input: Vector, gridSize: number) {
  return new Vector(closestGridPos(input.x, gridSize), closestGridPos(input.y, gridSize));
}

export function closestGridPos(input: number, diviableBy: number) {
  return Math.round(input / diviableBy) * diviableBy; //simplify as per Guffa
}

function FpsCtrl(fps: number, callback: (data: { time: number; frame: number; }) => void) {

  let delay = 1000 / fps;                               // calc. time per frame
  let time: number | null = null;                                      // start time
  let frame = -1;                                       // frame count
  let tref;                                             // rAF time reference

  function loop(timestamp: number) {
    if (time === null) time = timestamp;              // init start time
    const seg = Math.floor((timestamp - time) / delay); // calc frame no.
    if (seg > frame) {                                // moved to next frame?
      frame = seg;                                  // update
      callback({                                    // callback function
        time: timestamp,
        frame: frame
      })
    }
    tref = requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop);
}

@Component({
  selector: 'tiled-web-root',
  imports: [
    MainContainer,
    JsonPipe,
    NgIcon,
    Dialog
  ],
  providers: [
    provideIcons({heroEye})
  ],
  template: `
    <tiled-web-ui-main-container
      (projectUpload)="projectUpload($event)"
      (projectClosed)="closeProject()"
      (openExisting)="openExisting($event)"
    >
      {{ jsonFilesOnly | json }}
      <div body class="h-full w-full flex ">
        @if (jsonFilesOnly.length && !tileData) {
          <div class="flex flex-col">
            @for (file of jsonFilesOnly; track file.name) {
              <div
                class="cursor-pointer px-5  py-3 bg-primary-2 text-secondary text-gray-300  flex items-center flex-grow-0 flex-shrink-0">
                <p (click)="selectFile(file)" class="pl-5">{{ file.name }}</p>
              </div>
            }
          </div>
        }
        @if (tileData) {
          <div class="h-full flex flex-col gap-0.5 w-[250px]">
            @for (layer of tileData.layers; track layer.name; let i = $index) {
              <div (click)="tileData.layers[i].visible = !tileData.layers[i].visible"
                   class="cursor-pointer flex justify-between items-center px-5  py-3 bg-primary-2 text-secondary text-gray-300  flex items-center flex-grow-0 flex-shrink-0">
                <p class="{{tileData.layers[i].visible ? '' : 'line-through'}}">{{ layer.name }}</p>

                <div class="w-12 {{tileData.layers[i].visible ? 'text-green-500' : 'text-red-500'}}">
                  <ng-icon [name]="'heroEye'"/>
                </div>
              </div>
            }
          </div>
        }
        <div id="container" class="h-full flex-1 overflow-scroll no-scrollbar"></div>
        @if (tileData) {

          <div class="h-full flex flex-col overflow-x-hidden overflow-y-scroll no-scrollbar w-[350px]">
            <div
              class="w-full flex h-16 items-center flex-row overflow-x-scroll overflow-y-hidden no-scrollbar gap-0.5">
              @for (tileset of tileData.tilesets; track tileset.data.name) {
                <div (click)="selectTileset(tileset)"
                     class="cursor-pointer px-5  bg-primary-2 text-secondary text-gray-300 h-full  flex items-center flex-grow-0 flex-shrink-0">
                  <p>{{ tileset.data.name }}</p>
                </div>
              }
            </div>

            @if (selectedTileset) {
              <div class="w-full flex-1 overflow-scroll no-scrollbar">
                <div id="tilesetCanvas"></div>
              </div>
            }
          </div>
        }
        <tiled-web-ui-dialog/>
      </div>
    </tiled-web-ui-main-container>
  `,
  styles: [],
})
export class App implements OnInit {
  rootStore = inject(RootStore);

  loadedFromIndexedDb = false;
  zipFiles: JSZipObject[] = [];
  mapFile?: TmxJson;
  tileData?: CollectedMapData;
  httpClient = inject(HttpClient);
  selectedTileset?: TilesetExtended;

  cdr = inject(ChangeDetectorRef);

  projectLoader = inject(ProjectLoader);
  projectStore = inject(ProjectStore);

  tmxConverter = inject(TmxConverter);

  async ngOnInit() {
    await this.projectStore.init();
    const activeProject = await this.projectLoader.getBinary('active');
    if (activeProject) {
      this.cdr.markForCheck();
      this.loadedFromIndexedDb = true;
      this.zipBlob = new Blob([activeProject], {type: 'application/octet-stream'});
      const res2 = await jszip.loadAsync(this.zipBlob, {});
      this.zipFiles = Object.keys(res2.files).map(key => {
        return res2.files[key]
      });
      // await this.selectFile(this.zipFiles.find(f => f.name.includes('map1.json'))!);
      // this.selectTileset(this.tileData?.tilesets[0]);

      this.cdr.detectChanges();
      return;
    }

    /*this.httpClient.get('demo/game-map-1.zip', {
      responseType: 'blob'
    }).subscribe(async (res) => {
      this.cdr.markForCheck();
      this.zipBlob = res;
      if(!activeProject)
        await this.projectLoader.setBinary('active',await this.blobToUint8Array(res));

      const res2 = await jszip.loadAsync(this.zipBlob, {});
      this.zipFiles = Object.keys(res2.files).map(key => {
        return res2.files[key]
      });
      // await this.selectFile(this.zipFiles.find(f => f.name.includes('map1.json'))!);
      this.selectTileset(this.tileData?.tilesets[0]);

      this.cdr.detectChanges();

    })*/
  }

  private blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  async projectUpload(file: File) {
    this.cdr.markForCheck();
    await this.closeProject();
    const res = await jszip.loadAsync(file, {});
    this.zipFiles = Object.keys(res.files).map(key => {
      return res.files[key]
    });
    await this.projectStore.updateZipFileBlob(file);
    this.cdr.detectChanges();
  }

  async openExisting(projectName: string) {
    this.cdr.markForCheck();
    await this.projectStore.openProject(projectName);

    if (!this.projectStore.openZipFileBlob()) {
      this.cdr.detectChanges();

      return;
    }
    this.closeProject();
    const res = await jszip.loadAsync(this.projectStore.openZipFileBlob()!, {});
    this.zipFiles = Object.keys(res.files).map(key => {
      return res.files[key]
    });
    this.cdr.detectChanges();
  }

  zipBlob?: Blob;

  getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    const rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
      x: (evt.clientX - rect.left),   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top)     // been adjusted to be relative to element
    }
  }

  currentTilesetCanvas?: HTMLCanvasElement
  currentTilesetCtx?: CanvasRenderingContext2D;


  getMousePosTranformed(e: MouseEvent) {
    if (!this.currentTilesetCanvas || this.selectedTileset)
      return;
    const pos = this.getMousePos(this.currentTilesetCanvas, e);          // get adjusted coordinates as above
    // apply to point:
    const _pos = placeVectorInGrid(new Vector(pos.x, pos.y), this.selectedTileset!.data.tilewidth);
    console.log(_pos);
  }

  selectTileset(tileset?: TilesetExtended) {
    this.cdr.markForCheck();
    if (tileset) {
      this.selectedTileset = tileset;
      const data = TiledMapParser.createTilesetCanvas(tileset);
      setTimeout(() => {
        const canvasContainer = document.getElementById('tilesetCanvas')! as HTMLDivElement;
        const oldCanvas = canvasContainer.querySelector('canvas');
        if (oldCanvas)
          canvasContainer.removeChild(oldCanvas);
        this.currentTilesetCtx = data?.ctx;
        canvasContainer.appendChild(data?.canvas!);

        setTimeout(() => {
          data!.canvas.onmousemove = this.getMousePosTranformed.bind(this);
        }, 100);
        data?.draw();
      }, 100)
    }
    this.cdr.detectChanges();
  }

  async selectFile(file: JSZipObject) {
    this.cdr.markForCheck();
    let res: string | undefined = await file.async('string');

    if(file.name.endsWith('.tmx'))
      res = await this.tmxConverter.convertTmxToJson(res);

    if(!res) {
      console.error('Couldnt convert tmx!!');
      this.cdr.detectChanges();
      return;
    }

    const position = new Vector(0, 0);

    KeyboardHandlerService.listen();


    if (res) {
      this.mapFile = JSON.parse(res);
      console.log(this.mapFile);
      const res2 = await (file.name.endsWith('.tmx') ? TiledMapParserTmx :  TiledMapParser ).collectTileData(this.mapFile!, this.zipFiles);
      this.tileData = res2;
      const img = await (file.name.endsWith('.tmx') ? TiledMapParserTmx :  TiledMapParser ).createMapCanvas(res2, 0, 0, 1);
      const container = document.getElementById('container')! as HTMLDivElement;
      const oldCanvas = container.querySelector('canvas');
      if (oldCanvas)
        container.removeChild(oldCanvas);
      container!.appendChild(img.canvas);
      img.canvas.style.width = container.clientWidth + 'px';
      img.canvas.style.height = container.clientHeight + 'px';
      const drawWrapped = () => {
        img.ctx.clearRect(0, 0, img.canvas.width, img.canvas.height);
        img.ctx.save();
        img.ctx.translate(position.x, position.y);
        img.draw(this.tileData!);
        img.ctx.restore();
        /*if(KeyboardHandlerService.isKeyDown('w')) {
          position.y--;
        }
        if(KeyboardHandlerService.isKeyDown('a')) {
          position.x--;
        }
        if(KeyboardHandlerService.isKeyDown('s')) {
          position.y++;

        }
        if(KeyboardHandlerService.isKeyDown('d')) {
          position.x++;
        }*/
      }
      FpsCtrl(10, drawWrapped);
      // requestAnimationFrame(drawWrapped);
    }
    this.cdr.detectChanges();
  }

  get jsonFilesOnly() {
    return this.zipFiles; // .filter(f => f.name.endsWith('.json'));
  }

  closeProject() {
    this.cdr.markForCheck();
    const canvasContainer = document.getElementById('tilesetCanvas')! as HTMLDivElement;
    const canvas = canvasContainer?.querySelector('canvas');
    if (canvas)
      canvasContainer.removeChild(canvas);

    const container = document.getElementById('container')! as HTMLDivElement;
    const oldCanvas = container?.querySelector('canvas');
    if (oldCanvas)
      container.removeChild(oldCanvas);

    this.zipBlob = undefined;
    this.zipFiles = [];
    this.mapFile = undefined;
    this.tileData = undefined;
    this.cdr.detectChanges();
  }

}
