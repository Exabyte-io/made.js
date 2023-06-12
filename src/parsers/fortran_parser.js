import { regex } from "./utils";

/**
 * @summary Extracts an array of the key value pairs from a Fortran namelist.
 * @param {String} data
 * @returns {Object[]}
 */
function extractKeyValuePairs(data) {
    const output = {};

    const numberPairs = Array.from(data.matchAll(regex.numberKeyValue)).map((match) => [
        match[1],
        parseFloat(match[2]),
    ]);
    const stringPairs = Array.from(data.matchAll(regex.stringKeyValue)).map((match) => [
        match[1],
        match[2],
    ]);
    const booleanPairs = Array.from(data.matchAll(regex.booleanKeyValue)).map((match) => [
        match[1],
        match[2] === "true",
    ]);
    const numberArrayPairs = Array.from(data.matchAll(regex.numberArrayKeyValue)).map((match) => [
        match[1],
        parseFloat(match[3]),
    ]);

    [...numberPairs, ...stringPairs, ...booleanPairs].forEach((pair) => {
        // eslint-disable-next-line prefer-destructuring
        output[pair[0]] = pair[1];
    });

    numberArrayPairs.forEach((pair) => {
        if (!output[pair[0]]) output[pair[0]] = [];
        output[pair[0]].push(pair[1]);
    });

    return output;
}

/**
 * @summary Extracts namelist data from a string.
 * @param {String} text
 * @returns {Object}
 */
function extractNamelistData(text) {
    const namelistNameRegex = /&(\w+)/g;
    const matches = Array.from(text.matchAll(namelistNameRegex));
    const namelistNames = matches.map((match) => match[1].toLowerCase());

    // Create an object to hold all the key-value pairs for each namelist
    const namelists = {};

    // Iterate through each provided namelist name
    namelistNames.forEach((namelistName) => {
        // Create a new RegExp for the current namelist name
        const _regex = regex.namelists(namelistName);

        // Find the data for the current namelist
        const data = text.match(_regex)[2];

        // Extract the key-value pairs and store them in the namelists object
        namelists[namelistName] = extractKeyValuePairs(data);
    });
    return namelists;
}

/**
 * @summary Parses Fortran namelists and cards data from a string for a QE input file
 * @param {String} text
 * @returns {Object}
 */
export function parseFortranFile(text) {
    const output = extractNamelistData(text);
    // eslint-disable-next-line prefer-destructuring
    output.cards = text.match(regex.cards)[1];
    return output;
}
