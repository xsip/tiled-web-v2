export type TiledMap = {
  compressionlevel: number
  height: number
  infinite: boolean
  layers: Layer[]
  nextlayerid: number
  nextobjectid: number
  orientation: string
  renderorder: string
  tiledversion: string
  tileheight: number
  tilesets: TmxTileset[]
  tilewidth: number
  type: string
  version: string
  width: number
}

export type Layer = {
  id: number
  layers?: Layer2[]
  name: string
  opacity: number
  type: string
  visible: boolean
  x: number
  y: number
  data?: number[]
  height?: number
  width?: number
}

export type Layer2 = {
  data: number[]
  height: number
  id: number
  name: string
  opacity: number
  type: string
  visible: boolean
  width: number
  x: number
  y: number
}

export type TmxTileset = {
  firstgid: number
  source: string
}
