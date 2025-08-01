import {
  TiledMap,
  TiledMapV2, TileLayer,
  TileLayerExtended,
  TileMapData,
  Tileset,
  TilesetExtended, TilesetV2,
  TmxJson,
  TsxJson,
} from '@tiled-web/models';
import Vector from 'vector2js';
import {JSZipObject} from 'jszip';
import {XMLParser} from 'fast-xml-parser';

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export type CollectedMapData = {
  tiledMap: TmxJson;
  tilesets: TilesetExtended[]
  layers: TileLayerExtended[]
}

export class TiledMapParserTmx {
  public static async collectTileData(
    tiledMap: TmxJson,
    files: JSZipObject[]): Promise<CollectedMapData> {
    let tilesets: TilesetExtended[] = [];

    for (const tilemap of tiledMap.tilesets) {

      if('source' in tilemap) {
        tilesets.push(await TiledMapParserTmx.mapTileSetWithSource(tilemap, files));
      } else if ('name' in tilemap) {
        tilesets.push(await TiledMapParserTmx.mapTileSetWithoutSource(tilemap, files));
      }
    }
    const layersCpy = [...tiledMap.layers.map(layer => {
      return {
        ...layer,
        // @ts-ignore
        visible: layer.visible === '0' ? false : true,
        ids: []
      } as TileLayerExtended;
    })];
    let i = 0;
    for (const layer of layersCpy) {
      const tiles: TileMapData[] = [];

      tilesets = tilesets.map(ts => {
        const ids = TiledMapParserTmx.resolveTileIds(tiledMap, layer.name, ts);

        tiles.push(...ids);

        return {
          ...ts,
          ids: [...(ts.ids ?? []), ...ids],
        };
      });

      layersCpy[i].ids.push(...tiles);
      i++;
      // titleSetIndex++;
    }
    console.log(layersCpy);

    return {tiledMap, tilesets, layers: layersCpy};
  }

  private static parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '', // so attributes are not like "@_width"
  });

  private static async convertTsxToJson(tmxFile: string) {
    try {
      const map = TiledMapParserTmx.parser.parse(tmxFile).tileset ;
      map.width = parseInt(map.image.width);
      map.tilewidth = parseInt(map.tilewidth);
      map.tileheight = parseInt(map.tileheight);
      map.tilecount = parseInt(map.tilecount);
      map.spacing = parseInt(map.spacing);
      map.margin = parseInt(map.margin);
      map.column = parseInt(map.column);
      map.imageheight = parseInt(map.image.height);
      map.imagewidth = parseInt(map.image.width);
      map.height = parseInt(map.image.height);
      map.image = map.image.source;
      return JSON.stringify(map);
    } catch (err) {
      console.error('❌ Failed to convert:', err);
      return '{}';
    }
  }

  private static async mapTileSetWithSource(tilemap: Tileset,files: JSZipObject[]) {
    const fixedName = (tilemap.source); // .replace('.tsx', '.json');
    const arrayEntryName =
      fixedName.split('/')[tilemap.source.split('/').length - 1];
    let fileData = await files.find(f => f.name.includes(arrayEntryName))!.async('string');


    // const tileMapFetch = await fetch(tmJsonBaseUrl + arrayEntryName);
    // const tileMapJson = (await tileMapFetch.json()) as TsxJson;
    const tileMapJson =  JSON.parse( fixedName.endsWith('.tsx') ? await TiledMapParserTmx.convertTsxToJson(fileData!) : fileData!);
    console.log(tileMapJson);
    const tileMapImage = new Image();
    const blobImage = await files.find(f => f.name.includes(tileMapJson.image.split('/')[tileMapJson.image.split('/').length - 1]))!.async('blob');
    tileMapImage.src = await blobToBase64(blobImage);
    await new Promise(res => {
      tileMapImage.onload = res;
    });
    return {
      ...tilemap,
      firstgid: parseInt(tilemap.firstgid+''),
      element: tileMapImage,
      data: tileMapJson,
      ids: [],
    }
  }


  private static async mapTileSetWithoutSource(_tilemap: TilesetV2,files: JSZipObject[]) {
    const tileMapJson = _tilemap as unknown as TsxJson;
    const tileMapImage = new Image();
    const blobImage = await files.find(f => f.name.includes(tileMapJson.image.split('/')[tileMapJson.image.split('/').length - 1]))!.async('blob');
    tileMapImage.src = await blobToBase64(blobImage);
    await new Promise(res => {
      tileMapImage.onload = res;
    });
    return {
      ..._tilemap,
      firstgid: parseInt(_tilemap.firstgid+''),
      source: tileMapJson.image,
      element: tileMapImage,
      data: tileMapJson,
      ids: [],
    }
  }


  private static decodeBase64Layer(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const gids: number[] = [];
    for (let i = 0; i < bytes.length; i += 4) {
      const gid = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
      gids.push(gid);
    }

    return gids;
  }


  private static resolveTileIds(
    tiledMap: TmxJson,
    layerName: string = 'cave',
    tilesetExtended: TilesetExtended,
  ) {
    const excludeTilesWithoutProperties = true;
    // Bits on the far end of the 32-bit global tile ID are used for tile flags
    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
    const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;
    const layer: TileLayer = tiledMap.layers!.find(layer => layer!.name === layerName)! as TileLayer;
    // TODO: add again!
    /*if (layer.type !== 'tilelayer') {
      return [];
    }*/
    const tiledData: TileMapData[] = [];
    const mappedLayer: number[][] = [];
    if(layer.encoding === 'base64' && typeof layer.data === 'string')
      layer.data = TiledMapParserTmx.decodeBase64Layer(layer.data);
    for (let i = 0; i < layer.data!.length; i += layer.width!) {
      const row = (layer.data as number[])!.slice(i, layer.width! + i);
      mappedLayer.push(row);
    }
    mappedLayer.forEach((row) => {
      row.forEach((col) => {

        let global_tile_id = col;
        global_tile_id &= ~(
          FLIPPED_HORIZONTALLY_FLAG |
          FLIPPED_VERTICALLY_FLAG |
          FLIPPED_DIAGONALLY_FLAG |
          ROTATED_HEXAGONAL_120_FLAG
        );
        if (tilesetExtended.firstgid <= global_tile_id! && !tiledData.find(entry => entry.globalId === global_tile_id)) {
          tiledData.push({
            x: (global_tile_id! - tilesetExtended.firstgid) % tilesetExtended.data.columns,
            y: Math.floor((global_tile_id! - tilesetExtended.firstgid) / tilesetExtended.data.columns),
            tilemap: tilesetExtended,
            id: global_tile_id! - tilesetExtended.firstgid,
            globalId: global_tile_id!,
            info: tilesetExtended.data?.tiles?.find(
              e => e.id === global_tile_id! - tilesetExtended.firstgid,
            ),
          });
        }
      });
    });
    if (excludeTilesWithoutProperties) {
      // tiledData = tiledData.filter((e, i, a) => e.info);
    }
    return tiledData;
  }

  public static async createMapCached(
    collectedData: CollectedMapData, x: number = 0, y: number = 0, upScale = 4) {
    const canvas = document.createElement('canvas')!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = collectedData.tiledMap.width * collectedData.tiledMap.tilewidth * upScale;// GlobalGameData.canvas!.width;
    canvas.height = collectedData.tiledMap.height * collectedData.tiledMap.tileheight * upScale;// GlobalGameData.canvas!.height;
    for (const layer of collectedData.layers.filter(l => l.type === 'tilelayer')) {

      const mappedLayer: number[][] = [];
      for (let i = 0; i < layer.data!.length; i += layer.width!) {
        const row = (layer.data as number[])!.slice(i, layer.width! + i);
        mappedLayer.push(row);
      }
      const sprites: Record<string, HTMLImageElement> = {};
      // GlobalGameData.globalScale = 1;
      mappedLayer.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col !== 0) {
            const tileMapToUse = collectedData.tilesets.find(ts => ts.firstgid <= col && col <= (ts.firstgid + ts.data.tilecount));
            const _id = tileMapToUse?.ids.filter(e => {
              const res = e.globalId === col;
              return res;
            }) ?? [];
            const id = _id[0];
            if (!id) {
              return;
            }

            ctx!.globalAlpha = layer.opacity ?? 1;
            const frameSize = new Vector(collectedData.tiledMap.tilewidth, collectedData.tiledMap.tilewidth);
            const pos = new Vector(x +
              y + (colIndex * collectedData.tiledMap.tilewidth) * upScale,
              y +
              (rowIndex * collectedData.tiledMap.tileheight) * upScale);
            ctx?.drawImage(
              id.tilemap!.element,
              id.x * frameSize.x,
              id.y * frameSize.y,
              frameSize.x,
              frameSize.y,
              pos.x,
              pos.y,
              frameSize.x * upScale,
              frameSize.y * upScale
            );
            ctx!.globalAlpha = 1;
          }
        });
      });
    }
    const url = canvas.toDataURL('png');
    const image = new Image();
    image.src = url;

    await new Promise((res) => {
      image.onload = res;
    });
    // GlobalGameData.globalScale = oldGLobalScale;
    /*
    GlobalGameData.addStaticResource(resourceName, image);
    GlobalGameData.addSpriteToResource(resourceName);
    const resource = GlobalGameData.getResource(resourceName);
    resource.sprite!.displayMode = 'imageSize';
    this.addChild(resource.sprite!);*/
    return image;
  }

  public static async createMapCanvas(
    collectedData: CollectedMapData, x: number = 0, y: number = 0, upScale = 4) {
    const canvas = document.createElement('canvas')!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = collectedData.tiledMap.width * collectedData.tiledMap.tilewidth * upScale;// GlobalGameData.canvas!.width;
    canvas.height = collectedData.tiledMap.height * collectedData.tiledMap.tileheight * upScale;// GlobalGameData.canvas!.height;

    const draw = (data: CollectedMapData) => {
      for (const layer of collectedData.layers) {

        if(!layer.visible)
          continue;
        const mappedLayer: number[][] = [];

        if(layer.encoding === 'base64' && typeof layer.data === 'string')
          layer.data = TiledMapParserTmx.decodeBase64Layer(layer.data);

        for (let i = 0; i < layer.data!.length; i += layer.width!) {
          const row = (layer.data as number[])!.slice(i, layer.width! + i);
          mappedLayer.push(row);
        }

        mappedLayer.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            if (col !== 0) {
              const tileMapToUse = collectedData.tilesets.find(ts => ts.firstgid <= col && col <= (ts.firstgid + ts.data.tilecount));
              const _id = tileMapToUse?.ids.filter(e => {
                const res = e.globalId === col;
                return res;
              }) ?? [];
              const id = _id[0];
              if (!id) {
                return;
              }

              ctx!.globalAlpha = layer.opacity ?? 1;
              const frameSize = new Vector(collectedData.tiledMap.tilewidth, collectedData.tiledMap.tilewidth);
              const pos = new Vector(x +
                y + (colIndex * collectedData.tiledMap.tilewidth) * upScale,
                y +
                (rowIndex * collectedData.tiledMap.tileheight) * upScale);
              ctx?.drawImage(
                id.tilemap!.element,
                id.x * frameSize.x,
                id.y * frameSize.y,
                frameSize.x,
                frameSize.y,
                pos.x,
                pos.y,
                frameSize.x * upScale,
                frameSize.y * upScale
              );
              ctx!.globalAlpha = 1;
            }
          });
        });
      }
    }
    return {canvas, ctx, draw};
  }

  public static async parseObjectLayers(
    collectedData: CollectedMapData, x: number = 0, y: number = 0, upScale = 4) {
    const canvas = document.createElement('canvas')!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = collectedData.tiledMap.width * collectedData.tiledMap.tilewidth * upScale;// GlobalGameData.canvas!.width;
    canvas.height = collectedData.tiledMap.height * collectedData.tiledMap.tileheight * upScale;// GlobalGameData.canvas!.height;
    /*const tiledObjects: TiledObject[] = [];
    for(const objectLayer of (collectedData.layers as unknown as ObjectLayer[]).filter(layer => layer.type === 'objectgroup')) {
        objectLayer.objects.forEach(_obj => {
            const obj = _obj as Rectangle;
            tiledObjects.push(new TiledObject(obj));
            ctx.fillStyle = 'rgba(35,35,35,0.8)';
            ctx.fillRect(obj.x*upScale, obj.y*upScale, obj.width*upScale, obj.height*upScale);
        });
    }*/
    const url = canvas.toDataURL('png');
    const image = new Image();
    image.src = url;
    await new Promise((res) => {
      image.onload = res;
    });
    return {image};
  }


  public static createTilesetCanvas(tileset?: TilesetExtended, upScale = 1) {
    if(!tileset)
      return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = tileset.data.imagewidth *upScale;// GlobalGameData.canvas!.width;
    canvas.height = tileset.data.imageheight* upScale;// GlobalGameData.canvas!.height;
    const draw = () => {
      for(let y = 0; y < tileset.data.imageheight; y += tileset.data.tileheight) {
        for(let x = 0; x < tileset.data.imagewidth; x += tileset.data.tilewidth) {
          console.log(x,y);
          ctx.drawImage(tileset.element,x,y,tileset.data.tilewidth,tileset.data.tileheight,x,y,tileset.data.tilewidth*upScale,tileset.data.tileheight*upScale);
        }
      }
    }

    return {draw, canvas, ctx};
  }
}
