/**
 * @file This file contains JSDoc type definitions for the Cockpit API.
 * It is used to provide IntelliSense and type-checking for the global `cockpit` object.
 */

/**
 * @summary A promise-like object returned by many Cockpit API functions.
 * @template T The type of the value the promise resolves with.
 * @typedef {object} CockpitPromise
 * @property {(callback: (result: T) => void) => CockpitPromise<T>} done - Registers a callback for successful completion.
 * @property {(callback: (error: Error, result?: any) => void) => CockpitPromise<T>} fail - Registers a callback for failure.
 * @property {(callback: (result: T) => void) => CockpitPromise<T>} stream - Registers a callback for streaming results.
 * @property {(callback: () => void) => CockpitPromise<T>} always - Registers a callback to be called on completion, regardless of success or failure.
 */

/**
 * @typedef {object} CockpitSpawnOptions
 * @property {boolean} [superuser] - If true, run the command with root privileges. Can be "require", "try", or true.
 * @property {object} [environ] - Environment variables for the command.
 * @property {string} [err] - How to handle stderr. Can be "out", "ignore", "message".
 * @property {object} [session] - For session management.
 */

/**
 * @namespace cockpit
 * @summary The global object for interacting with the Cockpit system.
 */
var cockpit = {
    /**
     * @summary Spawns a command on the system.
     * @param {string[]} command - The command and its arguments as an array of strings.
     * @param {CockpitSpawnOptions} [options] - Options for spawning the command.
     * @returns {CockpitPromise<string>} A promise that resolves with the command's stdout.
     */
    spawn: function(command, options) { },

    /**
     * @summary Registers a callback to be executed when the Cockpit frame is ready.
     * @param {() => void} callback - The function to call when ready.
     * @returns {void}
     */
    ready: function(callback) { },
    
    /**
     * @summary Provides an object for reading and manipulating a file.
     * @param {string} path - The path to the file.
     * @param {object} [options] - Options for file access.
     * @returns {CockpitFile} A file object.
     */
    file: function(path, options) { },

    // You can add more cockpit methods here as you need them.
};

/**
 * @typedef {object} CockpitFile
 * @property {() => CockpitPromise<string>} read - Reads the entire content of the file.
 * @property {(content: string, etag?: string) => CockpitPromise<string>} replace - Replaces the content of the file.
 */