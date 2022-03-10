import { AreaLanding } from "../src/ts/area-landing";

describe("area-landing", () => {
    describe("#AreaLanding()", () => {
        test("#init() should return expected result", () => {
            const al = new AreaLanding();
            expect(al.init()).toEqual("Area Landing Page");
        })
    });
});
