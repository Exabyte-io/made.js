import { MaterialSchema } from "@mat3ra/esse/lib/js/types";
import _ from "underscore";
import s from "underscore.string";

import { Basis } from "../basis/basis";
import { ConstrainedBasis } from "../basis/constrained_basis";
import { Statistics } from "../codemirrorApi";
import { Constraint } from "../constraints/constraints";
import { Lattice } from "../lattice/lattice";
import { Vector } from "../lattice/types";
import math from "../math";
import { InvalidLineError } from "./errors";
import { CombinatorialBasis } from "./xyz_combinatorial_basis";

// Regular expression for an XYZ line with atomic constraints, eg. Si    0.000000    0.500000    0.446678 1 1 1`
// eslint-disable-next-line max-len
const XYZ_LINE_REGEX =
    /[A-Z][a-z]?\s+((-?\d+\.?\d*|\.\d+)\s+(-?\d+\.?\d*|\.\d+)\s+(-?\d+\.?\d*|\.\d+)(\s+)?(\s+[0-1]\s+[0-1]\s+[0-1](\s+)?)?)$/;

/**
 * Validates XYZ file's line. Line should be in following format "Si 0.5 0.5 0.5".
 * Raises an error if line is in wrong format.
 */
function validateLine(xyzLine: string, index: number) {
    const words = xyzLine.split(" ").filter((x) => x.trim() !== "");

    if (!xyzLine.match(XYZ_LINE_REGEX)) {
        throw new InvalidLineError(index, xyzLine);
    }

    const coordinates = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
    coordinates.forEach((num, i) => {
        if (_.isNaN(num)) {
            throw new Error(`Coordinates should be a number. Possible error in ${i} coordinate`);
        }
    });
}

/**
 * Validates that passed string is well-formed XYZ file.
 */
export function validate(xyzTxt: string) {
    // The @types/underscore.string package does not provide interfaces for function chaining at the moment. Disable TS here
    // @ts-ignore
    s(xyzTxt)
        .trim()
        .lines()
        .filter((x: string) => x.trim() !== "")
        .forEach(validateLine);
}

export interface ParsedObject {
    element: string;
    coordinates: Vector;
    constraints: [boolean, boolean, boolean];
}

/**
 * Parses XYZ line and returns an object.
 * @param line - line of text
 */
function _parseXYZLineAsWords(line: string): ParsedObject {
    const words = s.words(line);
    const constraint = (n: number) => parseInt(`${n}`, 10) !== 0;
    return {
        element: words[0],
        coordinates: [+words[1], +words[2], +words[3]],
        // Below maps zero values to false (atom is fixed) and non-zero values to true (atom is moving)
        constraints: [constraint(+words[4]), constraint(+words[5]), constraint(+words[6])],
    };
}

// TODO: reuse Basis Definition(s) from ESSE/Code.js instead
export interface BasisConfig {
    elements: {
        id: number;
        value: string;
        selection?: number; // positive number > 0 for multiple selections use as a bit combination
        from?: number; // position in source text
        to?: number; // position in source text
    }[];
    coordinates: {
        id: number;
        value: Vector;
    }[];
    units: string;
    cell: Vector[];
    constraints: Constraint[];
}

/**
 * Parse XYZ text for basis. Assuming only xyz lines without blank or comment lines inbetween.
 * @param txt Text
 * @param units Coordinate units
 * @param cell Basis Cell
 */
function toBasisConfig(txt: string, units = "angstrom", cell = Basis.defaultCell): BasisConfig {
    // @ts-ignore
    const lines: string[] = s(txt).trim().lines();
    const listOfObjects = _.map(lines, _parseXYZLineAsWords);

    const linePosition = (lineNumber: number) =>
        lines
            .filter((l: string, i: number) => i < lineNumber)
            .map((l) => l.length + 1)
            .reduce((sum, len) => sum + len, 0);
    return {
        elements: listOfObjects.map((elm, idx) => {
            return {
                id: idx,
                value: elm.element,
                from: linePosition(idx),
                to: linePosition(idx + 1),
            };
        }),
        coordinates: listOfObjects.map((elm, idx) => {
            return {
                id: idx,
                value: elm.coordinates,
            };
        }),
        units,
        cell,
        constraints: listOfObjects.map((elm, idx) => {
            return {
                id: idx,
                value: elm.constraints,
            };
        }),
    };
}

function selectionToBasis(basis: BasisConfig, selection: Statistics) {
    const aBetween = (a: number, b: number, c: number) => b <= a && a < c;
    basis.elements.forEach((e) => {
        e.selection = selection.ranges.some(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (r) => aBetween(r.from, e.from!, e.to!) || aBetween(r.to, e.from!, e.to!),
        )
            ? 1
            : 0;
    });
    return basis;
}

/**
 * Create XYZ from Basis class instance.
 * @param basisClsInstance Basis class instance.
 * @param printFormat Output format for coordinates.
 * @param skipRounding Whether to round the numbers (ie. to avoid negative zeros).
 * @return Basis string in XYZ format
 */
function fromBasis(
    basisClsInstance: ConstrainedBasis,
    printFormat = "%9.5f",
    skipRounding = false,
) {
    const XYZArray: string[] = [];
    basisClsInstance._elements.array.forEach((item, idx) => {
        // assume that _elements and _coordinates are indexed equivalently
        const element = s.sprintf("%-3s", item);
        const coordinates = basisClsInstance.getCoordinateByIndex(idx).map((x) => {
            return s.sprintf(printFormat, skipRounding ? x : math.precise(math.roundToZero(x)));
        });
        const constraints = basisClsInstance.constraints
            ? basisClsInstance.AtomicConstraints.getAsStringByIndex(idx)
            : "";
        XYZArray.push([element, coordinates.join(" "), constraints].join(" "));
    });
    return `${XYZArray.join("\n")}\n`;
}

/**
 * Create XYZ from Material class instance (or its JSON config).
 * @param materialOrConfig Material.
 * @param fractional Coordinate units as fractional.
 * @return Class Instance
 */
function fromMaterial(materialOrConfig: MaterialSchema, fractional = false): string {
    const lattice = new Lattice(materialOrConfig.lattice);
    // @ts-ignore
    const basis = new ConstrainedBasis({
        ...materialOrConfig.basis,
        cell: lattice.vectorArrays,
    });
    if (fractional) {
        basis.toCrystal();
    }
    return fromBasis(basis, "%11.6f");
}

export default {
    validate,
    fromMaterial,
    toBasisConfig,
    selectionToBasis,
    fromBasis,
    CombinatorialBasis,
};
