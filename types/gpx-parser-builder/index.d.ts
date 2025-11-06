declare module 'gpx-parser-builder' {
  export interface WaypointAttributes {
    lat: string | number;
    lon: string | number;
  }

  export interface Waypoint {
    $: WaypointAttributes;
    ele?: string | number;
    time?: string | Date;
    name?: string;
    cmt?: string;
    desc?: string;
    src?: string;
    sym?: string;
    type?: string;
    extensions?: any;
  }

  export interface TrackSegment {
    trkpt?: Waypoint[];
    extensions?: any;
  }

  export interface Track {
    name?: string;
    cmt?: string;
    desc?: string;
    src?: string;
    number?: number;
    type?: string;
    extensions?: any;
    trkseg?: TrackSegment[];
  }

  export interface Route {
    name?: string;
    cmt?: string;
    desc?: string;
    src?: string;
    number?: number;
    type?: string;
    extensions?: any;
  }

  export interface Metadata {
    name?: string;
    desc?: string;
    author?: any;
    time?: Date;
  }

  export default class GPX {
    $?: any;
    metadata?: Metadata;
    wpt?: Waypoint[];
    rte?: Route[];
    trk?: Track[];
    extensions?: any;

    constructor(object: any);
    
    static parse(gpxString: string): GPX | undefined;
    
    toString(options?: any): string;
  }
}
