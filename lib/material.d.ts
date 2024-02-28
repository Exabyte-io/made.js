import { HasConsistencyChecksHasMetadataNamedDefaultableInMemoryEntity } from "@exabyte-io/code.js/dist/entity";
import { AnyObject } from "@exabyte-io/code.js/dist/entity/in_memory";
import { ConsistencyCheck, DerivedPropertiesSchema, FileSourceSchema, MaterialSchema } from "@mat3ra/esse/lib/js/types";
import { ConstrainedBasis } from "./basis/constrained_basis";
import { Constraint } from "./constraints/constraints";
import { Lattice } from "./lattice/lattice";
import { BravaisConfigProps } from "./lattice/lattice_vectors";
import { BasisConfig } from "./parsers/xyz";
import { MaterialJSON } from "./types";
export declare const defaultMaterialConfig: {
    name: string;
    basis: {
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
        units: string;
    };
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
};
export interface MaterialSchemaJSON extends MaterialSchema, AnyObject {
}
type MaterialBaseEntity = InstanceType<typeof HasConsistencyChecksHasMetadataNamedDefaultableInMemoryEntity>;
export type MaterialBaseEntityConstructor<T extends MaterialBaseEntity = MaterialBaseEntity> = new (...args: any[]) => T;
export declare function MaterialMixin<T extends MaterialBaseEntityConstructor = MaterialBaseEntityConstructor>(superclass: T): {
    new (...config: any[]): {
        _json: MaterialSchemaJSON;
        toJSON(): MaterialJSON;
        src: FileSourceSchema;
        updateFormula(): void;
        /**
         * Gets Bolean value for whether or not a material is non-periodic vs periodic.
         * False = periodic, True = non-periodic
         */
        isNonPeriodic: boolean;
        /**
         * @summary Returns the specific derived property (as specified by name) for a material.
         */
        getDerivedPropertyByName(name: string): {
            name?: "volume" | undefined;
            units?: "angstrom^3" | undefined;
            value: number;
        } | {
            name?: "density" | undefined;
            units?: "g/cm^3" | undefined;
            value: number;
        } | {
            pointGroupSymbol?: string | undefined;
            spaceGroupSymbol?: string | undefined;
            tolerance?: {
                units?: "angstrom" | undefined;
                value: number;
            } | undefined;
            name?: "symmetry" | undefined;
        } | {
            name?: "elemental_ratio" | undefined;
            value: number;
            element?: string | undefined;
        } | {
            name?: "p-norm" | undefined;
            degree?: number | undefined;
            value: number;
        } | {
            name?: "inchi" | undefined;
            value: string;
        } | {
            name?: "inchi_key" | undefined;
            value: string;
        } | undefined;
        /**
         * @summary Returns the derived properties array for a material.
         */
        getDerivedProperties(): DerivedPropertiesSchema;
        /**
         * Gets material's formula
         */
        readonly formula: string;
        readonly unitCellFormula: string;
        /**
         * @param textOrObject Basis text or JSON object.
         * @param format Format (xyz, etc.)
         * @param unitz crystal/cartesian
         */
        setBasis(textOrObject: string | BasisConfig, format?: string, unitz?: string): void;
        setBasisConstraints(constraints: Constraint[]): void;
        readonly basis: BasisConfig;
        readonly Basis: ConstrainedBasis;
        /**
         * High-level access to unique elements from material instead of basis.
         */
        readonly uniqueElements: string[];
        lattice: BravaisConfigProps | undefined;
        readonly Lattice: Lattice;
        /**
         * Returns the inchi string from the derivedProperties for a non-periodic material, or throws an error if the
         *  inchi cannot be found.
         *  @returns {String}
         */
        getInchiStringForHash(): string;
        /**
         * Calculates hash from basis and lattice. Algorithm expects the following:
         * - asserts lattice units to be angstrom
         * - asserts basis units to be crystal
         * - asserts basis coordinates and lattice measurements are rounded to hash precision
         * - forms strings for lattice and basis
         * - creates MD5 hash from basisStr + latticeStr + salt
         * @param salt Salt for hashing, empty string by default.
         * @param isScaled Whether to scale the lattice parameter 'a' to 1.
         */
        calculateHash(salt?: string, isScaled?: boolean, bypassNonPeriodicCheck?: boolean): string;
        hash: string;
        /**
         * Calculates hash from basis and lattice as above + scales lattice properties to make lattice.a = 1
         */
        readonly scaledHash: string;
        /**
         * Converts basis to crystal/fractional coordinates.
         */
        toCrystal(): void;
        /**
         * Converts current material's basis coordinates to cartesian.
         * No changes if coordinates already cartesian.
         */
        toCartesian(): void;
        /**
         * Returns material's basis in XYZ format.
         */
        getBasisAsXyz(fractional?: boolean): string;
        /**
         * Returns material in Quantum Espresso output format:
         * ```
         *    CELL_PARAMETERS (angstroms)
         *    -0.543131284  -0.000000000   0.543131284
         *    -0.000000000   0.543131284   0.543131284
         *    -0.543131284   0.543131284   0.000000000
         *
         *    ATOMIC_POSITIONS (crystal)
         *    Si       0.000000000   0.000000000  -0.000000000
         *    Si       0.250000000   0.250000000   0.250000000
         * ```
         */
        getAsQEFormat(): string;
        /**
         * Returns material in POSCAR format. Pass `true` to ignore original poscar source and re-serialize.
         */
        getAsPOSCAR(ignoreOriginal?: boolean, omitConstraints?: boolean): string;
        /**
         * Returns a copy of the material with conventional cell constructed instead of primitive.
         */
        getACopyWithConventionalCell(): any;
        /**
         * @summary a series of checks for the material and returns an array of results in ConsistencyChecks format.
         * @returns Array of checks results
         */
        getConsistencyChecks(): ConsistencyCheck[];
        /**
         * @summary a series of checks for the material's basis and returns an array of results in ConsistencyChecks format.
         * @returns Array of checks results
         */
        getBasisConsistencyChecks(): ConsistencyCheck[];
        consistencyChecks: object[];
        addConsistencyChecks(array: object[]): void;
        _schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
        prop: (<T_1 = null>(name: string, defaultValue?: T_1 | undefined) => T_1) & (<T_2 = null>(name: string, defaultValue?: T_2 | undefined) => T_2) & (<T_3 = null>(name: string, defaultValue?: T_3 | undefined) => T_3) & (<T_4 = null>(name: string, defaultValue?: T_4 | undefined) => T_4) & (<T_5 = null>(name: string, defaultValue?: T_5 | undefined) => T_5);
        setProp: ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void);
        unsetProp: ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void);
        toJSONSafe: ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject);
        toJSONQuick: ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject);
        clone: ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any);
        schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
        validate: (() => void) & (() => void) & (() => void) & (() => void) & (() => void);
        clean: ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject);
        isValid: (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean);
        id: string;
        readonly cls: string;
        getClsName: (() => string) & (() => string) & (() => string) & (() => string) & (() => string);
        readonly slug: string;
        readonly isSystemEntity: boolean;
        getAsEntityReference: ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/dist/types").EntityReferenceSchema);
        getEntityByName: ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity);
        metadata: object;
        updateMetadata(object: object): void;
        name: string;
        setName(name: string): void;
        readonly isDefault: boolean;
    };
    readonly defaultConfig: {
        name: string;
        basis: {
            elements: {
                id: number;
                value: string;
            }[];
            coordinates: {
                id: number;
                value: number[];
            }[];
            units: string;
        };
        lattice: {
            type: string;
            a: number;
            b: number;
            c: number;
            alpha: number;
            beta: number;
            gamma: number;
            units: {
                length: string;
                angle: string;
            };
        };
    };
} & T;
export declare const Material: {
    new (...config: any[]): {
        _json: MaterialSchemaJSON;
        toJSON(): MaterialJSON;
        src: FileSourceSchema;
        updateFormula(): void;
        /**
         * Gets Bolean value for whether or not a material is non-periodic vs periodic.
         * False = periodic, True = non-periodic
         */
        isNonPeriodic: boolean;
        /**
         * @summary Returns the specific derived property (as specified by name) for a material.
         */
        getDerivedPropertyByName(name: string): {
            name?: "volume" | undefined;
            units?: "angstrom^3" | undefined;
            value: number;
        } | {
            name?: "density" | undefined;
            units?: "g/cm^3" | undefined;
            value: number;
        } | {
            pointGroupSymbol?: string | undefined;
            spaceGroupSymbol?: string | undefined;
            tolerance?: {
                units?: "angstrom" | undefined;
                value: number;
            } | undefined;
            name?: "symmetry" | undefined;
        } | {
            name?: "elemental_ratio" | undefined;
            value: number;
            element?: string | undefined;
        } | {
            name?: "p-norm" | undefined;
            degree?: number | undefined;
            value: number;
        } | {
            name?: "inchi" | undefined;
            value: string;
        } | {
            name?: "inchi_key" | undefined;
            value: string;
        } | undefined;
        /**
         * @summary Returns the derived properties array for a material.
         */
        getDerivedProperties(): DerivedPropertiesSchema;
        /**
         * Gets material's formula
         */
        readonly formula: string;
        readonly unitCellFormula: string;
        /**
         * @param textOrObject Basis text or JSON object.
         * @param format Format (xyz, etc.)
         * @param unitz crystal/cartesian
         */
        setBasis(textOrObject: string | BasisConfig, format?: string, unitz?: string): void;
        setBasisConstraints(constraints: Constraint[]): void;
        readonly basis: BasisConfig;
        readonly Basis: ConstrainedBasis;
        /**
         * High-level access to unique elements from material instead of basis.
         */
        readonly uniqueElements: string[];
        lattice: BravaisConfigProps | undefined;
        readonly Lattice: Lattice;
        /**
         * Returns the inchi string from the derivedProperties for a non-periodic material, or throws an error if the
         *  inchi cannot be found.
         *  @returns {String}
         */
        getInchiStringForHash(): string;
        /**
         * Calculates hash from basis and lattice. Algorithm expects the following:
         * - asserts lattice units to be angstrom
         * - asserts basis units to be crystal
         * - asserts basis coordinates and lattice measurements are rounded to hash precision
         * - forms strings for lattice and basis
         * - creates MD5 hash from basisStr + latticeStr + salt
         * @param salt Salt for hashing, empty string by default.
         * @param isScaled Whether to scale the lattice parameter 'a' to 1.
         */
        calculateHash(salt?: string, isScaled?: boolean, bypassNonPeriodicCheck?: boolean): string;
        hash: string;
        /**
         * Calculates hash from basis and lattice as above + scales lattice properties to make lattice.a = 1
         */
        readonly scaledHash: string;
        /**
         * Converts basis to crystal/fractional coordinates.
         */
        toCrystal(): void;
        /**
         * Converts current material's basis coordinates to cartesian.
         * No changes if coordinates already cartesian.
         */
        toCartesian(): void;
        /**
         * Returns material's basis in XYZ format.
         */
        getBasisAsXyz(fractional?: boolean): string;
        /**
         * Returns material in Quantum Espresso output format:
         * ```
         *    CELL_PARAMETERS (angstroms)
         *    -0.543131284  -0.000000000   0.543131284
         *    -0.000000000   0.543131284   0.543131284
         *    -0.543131284   0.543131284   0.000000000
         *
         *    ATOMIC_POSITIONS (crystal)
         *    Si       0.000000000   0.000000000  -0.000000000
         *    Si       0.250000000   0.250000000   0.250000000
         * ```
         */
        getAsQEFormat(): string;
        /**
         * Returns material in POSCAR format. Pass `true` to ignore original poscar source and re-serialize.
         */
        getAsPOSCAR(ignoreOriginal?: boolean, omitConstraints?: boolean): string;
        /**
         * Returns a copy of the material with conventional cell constructed instead of primitive.
         */
        getACopyWithConventionalCell(): any;
        /**
         * @summary a series of checks for the material and returns an array of results in ConsistencyChecks format.
         * @returns Array of checks results
         */
        getConsistencyChecks(): ConsistencyCheck[];
        /**
         * @summary a series of checks for the material's basis and returns an array of results in ConsistencyChecks format.
         * @returns Array of checks results
         */
        getBasisConsistencyChecks(): ConsistencyCheck[];
        consistencyChecks: object[];
        addConsistencyChecks(array: object[]): void;
        _schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
        prop: (<T = null>(name: string, defaultValue?: T | undefined) => T) & (<T_1 = null>(name: string, defaultValue?: T_1 | undefined) => T_1) & (<T_2 = null>(name: string, defaultValue?: T_2 | undefined) => T_2) & (<T_3 = null>(name: string, defaultValue?: T_3 | undefined) => T_3) & (<T_4 = null>(name: string, defaultValue?: T_4 | undefined) => T_4);
        setProp: ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void);
        unsetProp: ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void);
        toJSONSafe: ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject);
        toJSONQuick: ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject) & ((exclude?: string[] | undefined) => AnyObject);
        clone: ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any);
        schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
        validate: (() => void) & (() => void) & (() => void) & (() => void) & (() => void);
        clean: ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject) & ((config: AnyObject) => AnyObject);
        isValid: (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean);
        id: string;
        readonly cls: string;
        getClsName: (() => string) & (() => string) & (() => string) & (() => string) & (() => string);
        readonly slug: string;
        readonly isSystemEntity: boolean;
        getAsEntityReference: ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/src/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@exabyte-io/code.js/dist/types").EntityReferenceSchema);
        getEntityByName: ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity) & ((entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string) => import("@exabyte-io/code.js/dist/entity").InMemoryEntity);
        metadata: object;
        updateMetadata(object: object): void;
        name: string;
        setName(name: string): void;
        readonly isDefault: boolean;
    };
    readonly defaultConfig: {
        name: string;
        basis: {
            elements: {
                id: number;
                value: string;
            }[];
            coordinates: {
                id: number;
                value: number[];
            }[];
            units: string;
        };
        lattice: {
            type: string;
            a: number;
            b: number;
            c: number;
            alpha: number;
            beta: number;
            gamma: number;
            units: {
                length: string;
                angle: string;
            };
        };
    };
} & (new (...args: any[]) => {
    consistencyChecks: object[];
    addConsistencyChecks(array: object[]): void;
    _json: AnyObject;
    _schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
    prop<T = null>(name: string, defaultValue?: T | undefined): T;
    setProp(name: string, value: unknown): void;
    unsetProp(name: string): void;
    toJSON(exclude?: string[] | undefined): AnyObject;
    toJSONSafe(exclude?: string[] | undefined): AnyObject;
    toJSONQuick(exclude?: string[] | undefined): AnyObject;
    clone(extraContext?: object | undefined): any;
    schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
    validate(): void;
    clean(config: AnyObject): AnyObject;
    isValid(): boolean;
    id: string;
    readonly cls: string;
    getClsName(): string;
    readonly slug: string;
    readonly isSystemEntity: boolean;
    getAsEntityReference(byIdOnly?: boolean | undefined): import("@exabyte-io/code.js/src/types").EntityReferenceSchema;
    getEntityByName(entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string): import("@exabyte-io/code.js/dist/entity").InMemoryEntity;
}) & (new (...args: any[]) => {
    metadata: object;
    updateMetadata(object: object): void;
    _json: AnyObject;
    _schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
    prop<T_1 = null>(name: string, defaultValue?: T_1 | undefined): T_1;
    setProp(name: string, value: unknown): void;
    unsetProp(name: string): void;
    toJSON(exclude?: string[] | undefined): AnyObject;
    toJSONSafe(exclude?: string[] | undefined): AnyObject;
    toJSONQuick(exclude?: string[] | undefined): AnyObject;
    clone(extraContext?: object | undefined): any;
    schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
    validate(): void;
    clean(config: AnyObject): AnyObject;
    isValid(): boolean;
    id: string;
    readonly cls: string;
    getClsName(): string;
    readonly slug: string;
    readonly isSystemEntity: boolean;
    getAsEntityReference(byIdOnly?: boolean | undefined): import("@exabyte-io/code.js/src/types").EntityReferenceSchema;
    getEntityByName(entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string): import("@exabyte-io/code.js/dist/entity").InMemoryEntity;
}) & (new (...args: any[]) => {
    name: string;
    setName(name: string): void;
    _json: AnyObject;
    _schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
    prop<T_2 = null>(name: string, defaultValue?: T_2 | undefined): T_2;
    setProp(name: string, value: unknown): void;
    unsetProp(name: string): void;
    toJSON(exclude?: string[] | undefined): AnyObject;
    toJSONSafe(exclude?: string[] | undefined): AnyObject;
    toJSONQuick(exclude?: string[] | undefined): AnyObject;
    clone(extraContext?: object | undefined): any;
    schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
    validate(): void;
    clean(config: AnyObject): AnyObject;
    isValid(): boolean;
    id: string;
    readonly cls: string;
    getClsName(): string;
    readonly slug: string;
    readonly isSystemEntity: boolean;
    getAsEntityReference(byIdOnly?: boolean | undefined): import("@exabyte-io/code.js/src/types").EntityReferenceSchema;
    getEntityByName(entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string): import("@exabyte-io/code.js/dist/entity").InMemoryEntity;
}) & {
    new (...args: any[]): {
        readonly isDefault: boolean;
        _json: AnyObject;
        _schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
        prop<T_3 = null>(name: string, defaultValue?: T_3 | undefined): T_3;
        setProp(name: string, value: unknown): void;
        unsetProp(name: string): void;
        toJSON(exclude?: string[] | undefined): AnyObject;
        toJSONSafe(exclude?: string[] | undefined): AnyObject;
        toJSONQuick(exclude?: string[] | undefined): AnyObject;
        clone(extraContext?: object | undefined): any;
        schema: import("@exabyte-io/code.js/dist/entity/in_memory").SimpleSchema | null;
        validate(): void;
        clean(config: AnyObject): AnyObject;
        isValid(): boolean;
        id: string;
        readonly cls: string;
        getClsName(): string;
        readonly slug: string;
        readonly isSystemEntity: boolean;
        getAsEntityReference(byIdOnly?: boolean | undefined): import("@exabyte-io/code.js/src/types").EntityReferenceSchema;
        getEntityByName(entities: import("@exabyte-io/code.js/dist/entity").InMemoryEntity[], entity: string, name: string): import("@exabyte-io/code.js/dist/entity").InMemoryEntity;
    };
    readonly defaultConfig: object | null;
    createDefault(): any;
} & typeof import("@exabyte-io/code.js/dist/entity").InMemoryEntity;
export type Material = InstanceType<typeof Material>;
export {};
