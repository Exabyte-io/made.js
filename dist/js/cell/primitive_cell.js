"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitiveCell = void 0;
const math_1 = __importDefault(require("../math"));
/**
 * Routines for calculating primitive cell vectors from conventional cell Bravais parameters.
 * Following Setyawan, W., & Curtarolo, S. (2010). doi:10.1016/j.commatsci.2010.05.010
 */
const PRIMITIVE_CELLS = {
    CUB: ({ a }) => {
        return [
            [a, 0, 0],
            [0, a, 0],
            [0, 0, a],
        ];
    },
    FCC: ({ a }) => {
        return [
            [0.0, a / 2, a / 2],
            [a / 2, 0.0, a / 2],
            [a / 2, a / 2, 0.0],
        ];
    },
    BCC: ({ a }) => {
        return [
            [-a / 2, a / 2, a / 2],
            [a / 2, -a / 2, a / 2],
            [a / 2, a / 2, -a / 2],
        ];
    },
    TET: ({ a, c }) => {
        return [
            [a, 0, 0],
            [0, a, 0],
            [0, 0, c],
        ];
    },
    BCT: ({ a, c }) => {
        return [
            [-a / 2, a / 2, c / 2],
            [a / 2, -a / 2, c / 2],
            [a / 2, a / 2, -c / 2],
        ];
    },
    ORC: ({ a, b, c }) => {
        return [
            [a, 0, 0],
            [0, b, 0],
            [0, 0, c],
        ];
    },
    ORCF: ({ a, b, c }) => {
        return [
            [0, b / 2, c / 2],
            [a / 2, 0, c / 2],
            [a / 2, b / 2, 0],
        ];
    },
    ORCI: ({ a, b, c }) => {
        return [
            [-a / 2, b / 2, c / 2],
            [a / 2, -b / 2, c / 2],
            [a / 2, b / 2, -c / 2],
        ];
    },
    ORCC: ({ a, b, c }) => {
        return [
            [a / 2, b / 2, 0],
            [-a / 2, b / 2, 0],
            [0, 0, c],
        ];
    },
    HEX: ({ a, c }) => {
        return [
            [a / 2, (-a * math_1.default.sqrt(3)) / 2, 0],
            [a / 2, (a * math_1.default.sqrt(3)) / 2, 0],
            [0, 0, c],
        ];
    },
    RHL: ({ a, alpha }) => {
        const cosAlpha = math_1.default.cos((alpha / 180) * math_1.default.PI);
        const cosHalfAlpha = math_1.default.sqrt((1 / 2) * (1 + cosAlpha));
        const sinHalfAlpha = math_1.default.sqrt((1 / 2) * (1 - cosAlpha));
        return [
            [a * cosHalfAlpha, -a * sinHalfAlpha, 0.0],
            [a * cosHalfAlpha, a * sinHalfAlpha, 0.0],
            [
                (a * cosAlpha) / cosHalfAlpha,
                0.0,
                a * math_1.default.sqrt(1 - (cosAlpha * cosAlpha) / (cosHalfAlpha * cosHalfAlpha)),
            ],
        ];
    },
    MCL: ({ a, b, c, alpha }) => {
        const cosAlpha = math_1.default.cos((alpha / 180) * math_1.default.PI);
        return [
            [a, 0, 0],
            [0, b, 0],
            [0, c * cosAlpha, c * math_1.default.sqrt(1 - cosAlpha * cosAlpha)],
        ];
    },
    MCLC: ({ a, b, c, alpha }) => {
        const cosAlpha = math_1.default.cos((alpha / 180) * math_1.default.PI);
        return [
            [a / 2, b / 2, 0],
            [-a / 2, b / 2, 0],
            [0, c * cosAlpha, c * math_1.default.sqrt(1 - cosAlpha * cosAlpha)],
        ];
    },
    // Algorithm from http://pymatgen.org/_modules/pymatgen/core/lattice.html (from_params)
    TRI: ({ a, b, c, alpha, beta, gamma }) => {
        // convert angles to Radians
        // eslint-disable-next-line no-param-reassign
        [alpha, beta, gamma] = [alpha, beta, gamma].map(
        // @ts-ignore
        (x) => math_1.default.unit(x, "degree").to("rad").value);
        const [cosAlpha, cosBeta, cosGamma] = [alpha, beta, gamma].map((x) => math_1.default.cos(x));
        const [sinAlpha, sinBeta] = [alpha, beta].map((x) => math_1.default.sin(x));
        let acosArg = (cosAlpha * cosBeta - cosGamma) / (sinAlpha * sinBeta);
        if (acosArg < -1) {
            acosArg = -1;
        }
        else if (acosArg > 1) {
            acosArg = 1;
        }
        const gammaStar = math_1.default.acos(acosArg);
        const cosGammaStar = math_1.default.cos(gammaStar);
        const sinGammaStar = math_1.default.sin(gammaStar);
        return [
            [a * sinBeta, 0.0, a * cosBeta],
            [-b * sinAlpha * cosGammaStar, b * sinAlpha * sinGammaStar, b * cosAlpha],
            [0.0, 0.0, c],
        ];
    },
    // alternative implementation
    TRIalt: ({ a, b, c, alpha, beta, gamma }) => {
        const cosAlpha = math_1.default.cos((alpha / 180) * math_1.default.PI);
        const cosBeta = math_1.default.cos((beta / 180) * math_1.default.PI);
        const cosGamma = math_1.default.cos((gamma / 180) * math_1.default.PI);
        const sinGamma = math_1.default.sqrt(1 - cosGamma * cosGamma);
        return [
            [a, 0.0, 0.0],
            [b * cosGamma, b * sinGamma, 0.0],
            [
                c * cosBeta,
                (c / sinGamma) * (cosAlpha - cosBeta * cosGamma),
                (c / sinGamma) *
                    math_1.default.sqrt(sinGamma * sinGamma -
                        cosAlpha * cosAlpha -
                        cosBeta * cosBeta +
                        2 * cosAlpha * cosBeta * cosGamma),
            ],
        ];
    },
};
/**
 * Returns lattice vectors for a primitive cell for a lattice.
 * @param lattice - Lattice instance.
 * @param  skipRounding - whether to skip rounding the lattice vectors.
 * @return Cell.vectorsAsArray
 */
function primitiveCell(lattice, skipRounding = false) {
    const [vectorA, vectorB, vectorC] = PRIMITIVE_CELLS[lattice.type || "TRI"](lattice);
    // set precision and remove JS floating point artifacts
    if (!skipRounding) {
        [vectorA, vectorB, vectorC].map((vec) => vec.map((c) => math_1.default.precise(c)).map(math_1.default.roundToZero));
    }
    return [vectorA, vectorB, vectorC];
}
exports.primitiveCell = primitiveCell;
