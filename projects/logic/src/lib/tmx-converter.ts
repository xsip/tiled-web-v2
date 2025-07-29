import {Injectable} from '@angular/core';
import {XMLParser} from 'fast-xml-parser';

@Injectable({
  providedIn: 'root'
})
export class TmxConverter {
  private parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '', // so attributes are not like "@_width"
    isArray: (tagName) => ['layer', 'tileset'].includes(tagName)
  });

  pluralizeArrayKeys(obj: any): any {
    if (Array.isArray(obj)) return obj.map(this.pluralizeArrayKeys.bind(this));
    if (typeof obj !== 'object' || obj === null) return obj;

    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const val = this.pluralizeArrayKeys(value);
      if (Array.isArray(val)) {
        if (key === 'layer') newObj['layers'] = val;
        else if (key === 'tileset') newObj['tilesets'] = val;
        else newObj[key] = val;
      } else {
        newObj[key] = val;
      }
    }
    return newObj;
  }

  async convertTmxToJson(tmxFile: string) {
    try {
      const map = this.pluralizeArrayKeys(this.parser.parse(tmxFile).map);
      map.layers = map.layers.map((layer: any) => {

        if(layer.data.encoding === 'csv') {
          const dataCpy = layer.data['#text'].split(",").map((str: string) => Number(str.trim()));
          layer.data = dataCpy;
        }
        layer.width = parseInt(layer.width);
        layer.height = parseInt(layer.height);
        return layer;
      })
      map.width = parseInt(map.width);
      map.height = parseInt(map.height);

      map.tilewidth = parseInt(map.tilewidth);
      map.tileheight = parseInt(map.tileheight);

      console.log(map);
      return JSON.stringify(map);
    } catch (err) {
      console.error('❌ Failed to convert:', err);
      return;
    }
  }

}
