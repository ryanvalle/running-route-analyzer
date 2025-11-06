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
    extensions?: Record<string, unknown>;
  }

  export interface TrackSegment {
    trkpt?: Waypoint[];
    extensions?: Record<string, unknown>;
  }

  export interface Track {
    name?: string;
    cmt?: string;
    desc?: string;
    src?: string;
    number?: number;
    type?: string;
    extensions?: Record<string, unknown>;
    trkseg?: TrackSegment[];
  }

  export interface Route {
    name?: string;
    cmt?: string;
    desc?: string;
    src?: string;
    number?: number;
    type?: string;
    extensions?: Record<string, unknown>;
  }

  export interface Metadata {
    name?: string;
    desc?: string;
    author?: Record<string, unknown>;
    time?: Date;
  }

  export default class GPX {
    $?: Record<string, unknown>;
    metadata?: Metadata;
    wpt?: Waypoint[];
    rte?: Route[];
    trk?: Track[];
    extensions?: Record<string, unknown>;

    constructor(object: Record<string, unknown>);
    
    static parse(gpxString: string): GPX | undefined;
    
    toString(options?: Record<string, unknown>): string;
  }
}
