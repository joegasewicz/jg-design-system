import { LngLatBoundsLike, LngLatLike, Map } from "mapbox-gl";
export interface IMapComponent {
    init: () => void;
    readonly bounds: LngLatBoundsLike;
    readonly map: Map;
}
export interface IMapComponentOptions {
    readonly style: string;
    readonly center: LngLatLike;
    readonly zoom?: number;
    readonly token: string;
    readonly mapID?: string;
}
declare type Context = {
    hasMoved: boolean;
    canvasTabbed: boolean;
};
declare class MapState {
    context: Context;
    constructor();
    update(state?: {}): void;
}
export declare class MapComponent {
    mapState: MapState;
    readonly map: Map;
    private onsCustomControls;
    readonly bounds: LngLatBoundsLike;
    readonly style: string;
    readonly center: LngLatLike;
    readonly zoom: number;
    readonly token: string;
    readonly mapID: any;
    constructor(options: IMapComponentOptions);
    init(): void;
    private addControls;
    private addEvents;
    static AddResetBtn(ctrlElement: HTMLButtonElement): void;
}
export {};
