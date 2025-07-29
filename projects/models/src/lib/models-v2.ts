export interface TiledMapV2 {
  compressionlevel: number;
  height:           number;
  infinite:         boolean;
  layers:           LayerV2[];
  nextlayerid:      number;
  nextobjectid:     number;
  orientation:      string;
  renderorder:      string;
  tiledversion:     string;
  tileheight:       number;
  tilesets:         TilesetV2[];
  tilewidth:        number;
  type:             string;
  version:          string;
  width:            number;
}

export interface LayerV2 {
  compression: string;
  data:        string;
  encoding:    string;
  height:      number;
  id:          number;
  name:        string;
  opacity:     number;
  type:        string;
  visible:     boolean;
  width:       number;
  x:           number;
  y:           number;
}

export interface TilesetV2 {
  columns:     number;
  firstgid:    number;
  image:       string;
  imageheight: number;
  imagewidth:  number;
  margin:      number;
  name:        string;
  spacing:     number;
  tilecount:   number;
  tileheight:  number;
  tilewidth:   number;
}
