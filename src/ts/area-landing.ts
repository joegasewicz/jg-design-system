interface IAreaLanding {
    init(): void;
}

export class AreaLanding implements IAreaLanding {
    public init(): string {
        console.info("Area Landing Page");
        return "Area Landing Page";
    }
}

const areaLanding = new AreaLanding();
areaLanding.init();
