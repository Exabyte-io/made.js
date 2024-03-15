import { expect } from "chai";
import { assert } from "console";

import { Statistics } from "../../src/codemirrorApi";
import xyz from "../../src/parsers/xyz";
import selectionJson from "./codewarrior_selection.json";

describe("Parsers:XYZ:selectionToBasis", () => {
    it("should alter basis from codewarrior selection", () => {
        // from pyridine.xyz
        const text = `C       -0.180226841      0.360945118     -1.120304970
C       -0.180226841      1.559292118     -0.407860970
C       -0.180226841      1.503191118      0.986935030
N       -0.180226841      0.360945118      1.29018350
C       -0.180226841     -0.781300882      0.986935030
C       -0.180226841     -0.837401882     -0.407860970
H       -0.180226841      0.360945118     -2.206546970
H       -0.180226841      2.517950118     -0.917077970
H       -0.180226841      2.421289118      1.572099030
H       -0.180226841     -1.699398882      1.572099030
H       -0.180226841     -1.796059882     -0.917077970

`;
        const basis = xyz.toBasisConfig(text);
        expect(basis.elements.length).to.equal(11);
        expect(basis.elements[0]).to.contains({ from: 0, to: 55, id: 0 });
        expect(basis.elements[1]).to.contains({ from: 55, to: 110, id: 1 });
        expect(basis.elements[2]).to.contains({ from: 110, to: 165, id: 2 });
        expect(basis.elements[10]).to.contains({ from: 549, to: 604, id: 10 });

        // assure no selection immediately after parsing
        assert(!basis.elements[0].selection);
        assert(!basis.elements[1].selection);

        const b2 = xyz.selectionToBasis(basis, selectionJson as unknown as Statistics);

        // selected all carbon atoms
        expect(b2.elements.filter((e) => e.selection).length).to.equal(5);
        expect(b2.elements.filter((e) => e.value === "C").length).to.equal(5);
        expect(b2.elements.filter((e) => e.value === "C" && e.selection).length).to.equal(5);
    });
});
