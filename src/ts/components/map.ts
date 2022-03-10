import { FullscreenControl, LngLatBoundsLike, LngLatLike, Map, NavigationControl } from "mapbox-gl";

interface IMapComponent {
    init: () => void;
    readonly bounds: LngLatBoundsLike;
    readonly map: Map;
}

interface IMapComponentOptions {
    readonly style: string;
    readonly center: LngLatLike;
    readonly zoom?: number;
    readonly token: string;
    readonly mapID?: string;
}

enum Keys {
    R = 82,
    ESCAPE = 9,
}

type Context = { hasMoved: boolean, canvasTabbed: boolean };

class MapState {
    // TODO make context readonly
    public context: Context;

    constructor() {
      this.context = {
        hasMoved: false,
        canvasTabbed: false
      };
    }
  
    public update(state = {}) {
      this.context = { ...this.context,
        ...state
      };
    }
 }

class ONSCustomControl {
    private _controlElements: Array<HTMLElement | null> = [];
    public mapState: MapState;
    public center: LngLatLike;
    public zoom: number;
    map!: Map;
    container!: HTMLButtonElement;

    constructor(center: LngLatLike, zoom: number, mapState: MapState) {
        this.mapState = mapState;
        this.center = center;
        this.zoom = zoom;
    }

    set controlElements(val) {
        if (!this._controlElements.length) {
        this._controlElements = val.map((elem, i) => {
            if (elem) {
                elem.setAttribute("tabindex", 0 .toString());
                return elem;
            }
            return null;
        });
        } else {
        throw new Error("Attribute 'controlElements' already set");
        }
    }

    get controlElements() {
        return this._controlElements;
    }

    public onAdd(map: Map) {
        this.map = map;
        this.container = document.createElement("button");
        this.container.className = "mapboxgl-ctrl-reset";
        this.container.addEventListener("click", this.onReset);
        this.map.getCanvas().addEventListener("keydown", this.onKeyDown);
        return this.container;
    }

    public onRemove() {
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            (this.map as any) = null;
        }
    }

    private onReset = (e: Event) => {
        this.map.flyTo({
        center: this.center,
        zoom: this.zoom
        });
        (this.container.firstChild as HTMLElement).className = "mapboxgl-ctrl-icon mapboxgl-ctrl-icon--disabled";
        this.mapState.update({
            hasMoved: false
        });
        this.container.disabled = true;
    };

    private onKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        const canvas = this.map.getCanvas();

        if (e.which === Keys.R) {
        this.onReset(e);

        return;
        }

        if (e.which === Keys.ESCAPE) {
        canvas.blur();
        }
    };
}

export class MapComponent {
    public mapState!: MapState;
    public readonly map: Map;
    private onsCustomControls!: ONSCustomControl;
    public readonly bounds: LngLatBoundsLike = [
        [-7.9454024125535625, 48.95006696529006], // south-west
        [2.549589409450192, 60.86791183866015] // north-west
    ];
    public readonly style: string;
    public readonly center: LngLatLike;
    public readonly zoom: number;
    public readonly token: string;
    public readonly mapID: any;

    constructor(options: IMapComponentOptions) {
        const { style, center, zoom = 6, token, mapID } = options;
        this.style = style;
        this.center = center;
        this.zoom = zoom;
        this.token = token;
        this.mapID = mapID;

        this.map = new Map({
            container: this.mapID,
            style: this.style,
            center: this.center,
            zoom: this.zoom,
            attributionControl: false,
            maxBounds: this.bounds,
        });
    }

    public init(): void {
        this.addControls();
        this.addEvents();
    }

    private addControls(): void {
        this.map.addControl(new FullscreenControl({}));
        this.map.addControl(new NavigationControl({
            showCompass: false
        }));
        this.onsCustomControls = new ONSCustomControl(this.center,this.zoom, this.mapState);
        this.map.addControl(this.onsCustomControls, "top-right");

        MapComponent.AddResetBtn(this.onsCustomControls.container);

        this.map.dragRotate.disable();
        // Set tab indexes
        this.map.touchZoomRotate.disableRotation(); 
        // Lazily load these controlElements after ONSCustomControl has been instantiated
        this.map.getCanvas().setAttribute("tabindex", "0"); 

        this.onsCustomControls.controlElements = [
            document.querySelector(".mapboxgl-ctrl-zoom-in"),
            document.querySelector(".mapboxgl-ctrl-reset"),
            document.querySelector(".mapboxgl-ctrl-zoom-out"),
            document.querySelector(".mapboxgl-ctrl-fullscreen")
        ];
    }

    private addEvents(): void {
        this.map.on("load", () => {
            // Resize map to as setting the height and width in css distorts the ratio of the map
            this.map.resize();
        });
        this.map.on("movestart", () => {
            // update reset btn default icon
            if (!this.mapState.context.hasMoved) {
            this.mapState.update({
                hasMoved: false
            });
            this.onsCustomControls.container.disabled = false;
            (this.onsCustomControls.container.firstChild as HTMLElement).className = "mapboxgl-ctrl-icon";
            }
        });
        this.map.on("move", () => {
            /** ------- Debugging TODO remove -------- */
            console.debug("center: ", this.map.getCenter());
            console.debug("zoom: ", this.map.getZoom());
        });
    }

    static AddResetBtn(ctrlElement: HTMLButtonElement) {
        const ctrlSpan = document.createElement("span");
        ctrlElement.disabled = true;
        ctrlSpan.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-icon--disabled";
        ctrlElement.appendChild(ctrlSpan); // Move container element to zoom control container div
      
        const containerZoomDiv = document.querySelector("#map > .mapboxgl-control-container > .mapboxgl-ctrl-top-right > div:nth-child(2)");
        if (containerZoomDiv) {
            containerZoomDiv.appendChild(ctrlElement);
        }
      }
}
