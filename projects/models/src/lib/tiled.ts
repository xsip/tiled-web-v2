// custom

export type TileMapData = {
  x: number
  y: number
  id: number
  tilemap?: TilesetExtended;
  globalId: number
  info?: BaseLayer
}
export type TilesetExtended = {
  element: HTMLImageElement;
  data: TsxJson;
  ids: TileMapData[];
} & Tileset

export type TileLayerExtended = {
  ids: TileMapData[];
} & TileLayer



export type TypedProperty<Type extends string, ValueType> = {
  name: string;
  type: Type;
  value: ValueType;
}

export type Property = TypedProperty<'int', number> | TypedProperty<'string', string>;

export type BaseLayer = {
  height: number;
  id?: number;
  name: string;
  offsetx?: number;
  offsety?: number;
  opacity?: number;
  properties?: Array<Property>;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export type ImageLayer = {
  type: 'imagelayer';
  image: string;
  transparentcolor?: string;
} & BaseLayer

export type GroupLayer = {
  type: 'group';
  layers: Array<TmxLayer>;
} & BaseLayer

export type ObjectLayer = {
  type: 'objectgroup';
  draworder: 'topdown' | 'index';
  objects: Array<GeometryObject>;
} & BaseLayer

export type TileLayer = {
  type: 'tilelayer';
  chunks?: Chunk[];
  data?: number[];
  encoding?: 'csv' | 'base64';
  compression?: 'zlib' | 'gzip';
} & BaseLayer

export type Chunk = {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}

export type TmxLayer = TileLayer | ObjectLayer | GroupLayer | ImageLayer;



export type Tileset = {
  firstgid: number;
  source: string;
}

export type TmxJson = {
  height: number;
  infinite: boolean;
  layers: TmxLayer[];
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: Tileset[];
  tilewidth: number;
  type: string;
  version: number;
  width: number;
}

export type TsxJson = {
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
  type: string;
  tiles?: BaseLayer[];
}

export type TilesObject = {
  [id: string]: {
    animation: Array<{ duration: number; tileid: number }>;
  };
}


// geometry


export type BaseObject = {
  id: number;
  name: string;
  properties?: Array<Property>;
  rotation?: 0;
  type: string;
  visible: boolean;
  template?: unknown; // maybe we support this in the late future...
  x: number;
  y: number;
}

export type TilemapObject = {
  gid: string;
} & BaseObject

export type Ellipse = {
  ellipse: true;
  height: number;
  width: number;
} & BaseObject

export type Rectangle = {
  height: number;
  width: number;
} & BaseObject

export type Point = {
  point: true;
} & BaseObject

export type Polygon = {
  polygon: Array<{ x: number; y: number }>;
} & BaseObject

export type Polyline = {
  polyline: Array<{ x: number; y: number }>;
} & BaseObject

export type Text = {
  height: number;
  width: number;
  text: { [key: string]: string };
} & BaseObject

export type GeometryObject = TilemapObject | Ellipse | Rectangle | Point | Polygon | Polyline | Text;

