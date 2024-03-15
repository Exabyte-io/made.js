import { expect } from "chai";

import parsers from "../../src/parsers/parsers";
import Si from "../fixtures/Si.json";

describe("Parsers:XYZ", () => {
    it("should extract basis from XYZ text", () => {
        const text = "Si 0 0 0 \n Si 0.25 0.25 0.25";
        const basis = parsers.xyz.toBasisConfig(text);
        expect(basis.elements.length).to.equal(Si.basis.elements.length);
        expect(basis.elements[0]).to.contains(Si.basis.elements[0]);
        expect(basis.elements[1]).to.contains(Si.basis.elements[1]);
    });
});
