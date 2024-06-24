/* eslint no-unused-vars: 0 */
import { LatticeImplicitSchema } from "@mat3ra/esse/dist/js/types";

import { VectorsAsArray } from "../lattice/types";
import math from "../math";

/**
 * Routines for calculating primitive cell vectors from conventional cell Bravais parameters.
 * Following Setyawan, W., & Curtarolo, S. (2010). doi:10.1016/j.commatsci.2010.05.010
 */
const PRIMITIVE_CELLS = {
    CUB: ({ a }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [a, 0, 0],
            [0, a, 0],
            [0, 0, a],
        ];
    },

    FCC: ({ a }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [0.0, a / 2, a / 2],
            [a / 2, 0.0, a / 2],
            [a / 2, a / 2, 0.0],
        ];
    },

    BCC: ({ a }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [-a / 2, a / 2, a / 2],
            [a / 2, -a / 2, a / 2],
            [a / 2, a / 2, -a / 2],
        ];
    },

    TET: ({ a, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [a, 0, 0],
            [0, a, 0],
            [0, 0, c],
        ];
    },

    BCT: ({ a, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [-a / 2, a / 2, c / 2],
            [a / 2, -a / 2, c / 2],
            [a / 2, a / 2, -c / 2],
        ];
    },

    ORC: ({ a, b, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [a, 0, 0],
            [0, b, 0],
            [0, 0, c],
        ];
    },

    ORCF: ({ a, b, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [0, b / 2, c / 2],
            [a / 2, 0, c / 2],
            [a / 2, b / 2, 0],
        ];
    },

    ORCI: ({ a, b, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [-a / 2, b / 2, c / 2],
            [a / 2, -b / 2, c / 2],
            [a / 2, b / 2, -c / 2],
        ];
    },

    ORCC: ({ a, b, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [a / 2, b / 2, 0],
            [-a / 2, b / 2, 0],
            [0, 0, c],
        ];
    },

    HEX: ({ a, c }: LatticeImplicitSchema): VectorsAsArray => {
        return [
            [a / 2, (-a * math.sqrt(3)) / 2, 0],
            [a / 2, (a * math.sqrt(3)) / 2, 0],
            [0, 0, c],
        ];
    },

    RHL: ({ a, alpha }: LatticeImplicitSchema): VectorsAsArray => {
        const cosAlpha = math.cos((alpha / 180) * math.PI);
        const cosHalfAlpha = math.sqrt((1 / 2) * (1 + cosAlpha));
        const sinHalfAlpha = math.sqrt((1 / 2) * (1 - cosAlpha));
        return [
            [a * cosHalfAlpha, -a * sinHalfAlpha, 0.0],
            [a * cosHalfAlpha, a * sinHalfAlpha, 0.0],
            [
                (a * cosAlpha) / cosHalfAlpha,
                0.0,
                a * math.sqrt(1 - (cosAlpha * cosAlpha) / (cosHalfAlpha * cosHalfAlpha)),
            ],
        ];
    },

    MCL: ({ a, b, c, alpha }: LatticeImplicitSchema): VectorsAsArray => {
        const cosAlpha = math.cos((alpha / 180) * math.PI);
        return [
            [a, 0, 0],
            [0, b, 0],
            [0, c * cosAlpha, c * math.sqrt(1 - cosAlpha * cosAlpha)],
        ];
    },

    MCLC: ({ a, b, c, alpha }: LatticeImplicitSchema): VectorsAsArray => {
        const cosAlpha = math.cos((alpha / 180) * math.PI);
        return [
            [a / 2, b / 2, 0],
            [-a / 2, b / 2, 0],
            [0, c * cosAlpha, c * math.sqrt(1 - cosAlpha * cosAlpha)],
        ];
    },

    // Algorithm from http://pymatgen.org/_modules/pymatgen/core/lattice.html (from_params)
    TRI: ({ a, b, c, alpha, beta, gamma }: LatticeImplicitSchema): VectorsAsArray => {
        // convert angles to Radians
        // eslint-disable-next-line no-param-reassign
        [alpha, beta, gamma] = [alpha, beta, gamma].map(
            // @ts-ignore
            (x) => math.unit(x, "degree").to("rad").value,
        );

        const [cosAlpha, cosBeta, cosGamma] = [alpha, beta, gamma].map((x) => math.cos(x));
        const [sinAlpha, sinBeta] = [alpha, beta].map((x) => math.sin(x));
        let acosArg = (cosAlpha * cosBeta - cosGamma) / (sinAlpha * sinBeta);
        if (acosArg < -1) {
            acosArg = -1;
        } else if (acosArg > 1) {
            acosArg = 1;
        }
        const gammaStar = math.acos(acosArg);
        const cosGammaStar = math.cos(gammaStar);
        const sinGammaStar = math.sin(gammaStar);

        return [
            [a * sinBeta, 0.0, a * cosBeta],
            [-b * sinAlpha * cosGammaStar, b * sinAlpha * sinGammaStar, b * cosAlpha],
            [0.0, 0.0, c],
        ];
    },

    // alternative implementation
    TRIalt: ({ a, b, c, alpha, beta, gamma }: LatticeImplicitSchema): VectorsAsArray => {
        const cosAlpha = math.cos((alpha / 180) * math.PI);
        const cosBeta = math.cos((beta / 180) * math.PI);
        const cosGamma = math.cos((gamma / 180) * math.PI);
        const sinGamma = math.sqrt(1 - cosGamma * cosGamma);
        return [
            [a, 0.0, 0.0],
            [b * cosGamma, b * sinGamma, 0.0],
            [
                c * cosBeta,
                (c / sinGamma) * (cosAlpha - cosBeta * cosGamma),
                (c / sinGamma) *
                    math.sqrt(
                        sinGamma * sinGamma -
                            cosAlpha * cosAlpha -
                            cosBeta * cosBeta +
                            2 * cosAlpha * cosBeta * cosGamma,
                    ),
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
export function primitiveCell(
    lattice: LatticeImplicitSchema,
    skipRounding = false,
): VectorsAsArray {
    const [vectorA, vectorB, vectorC] = PRIMITIVE_CELLS[lattice.type || "TRI"](lattice);
    // set precision and remove JS floating point artifacts
    if (!skipRounding) {
        [vectorA, vectorB, vectorC].map((vec) =>
            vec.map((c) => math.precise(c)).map(math.roundToZero),
        );
    }
    return [vectorA, vectorB, vectorC];
}
