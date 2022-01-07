import { expect } from "chai";

import parsers from "../../src/parsers/parsers";
import { xyzFileAtomsCount, xyzToPoscar } from "../../src/parsers/xyz";
import { CH4, CH4POSCAR, Si } from "../enums";
import { assertDeepAlmostEqual } from "../utils";

describe("Parsers:XYZ", () => {
    it("should extract basis from XYZ text", () => {
        const text = "Si 0 0 0 \n Si 0.25 0.25 0.25";
        assertDeepAlmostEqual(parsers.xyz.toBasisConfig(text), Si.basis, [
            "constraints",
            "cell",
            "units",
        ]);
    });
    it("should return the number of atoms for a molecule in an xyz file", () => {
        expect(xyzFileAtomsCount(CH4)).to.be.equal(5);
    });
    it("should return the xyz file content in poscar file format", () => {
        assertDeepAlmostEqual(xyzToPoscar(CH4), CH4POSCAR);
    });
});
