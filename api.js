//. @ts-check
/// <reference path="cockpit.d.js" />

// JSDoc Type Definitions for the data structure returned by the script.

/**
 * @typedef {Object} SSLInfo
 * @property {boolean} enabled
 * @property {?string} certificate_path
 * @property {?string} certificate_domains
 * @property {?string} expiry_date - ISO 8601 formatted date string.
 */

/**
 * @typedef {Object} ProxyInfo
 * @property {boolean} enabled
 * @property {?string} url
 * @property {?string} port
 */

/**
 * @typedef {Object} StaticInfo
 * @property {boolean} enabled
 * @property {?string} root_path
 */

/**
 * @typedef {Object} DockerInfo
 * @property {?string} container
 * @property {boolean} connected
 */

/**
 * @typedef {Object} StatusInfo
 * @property {'UP'|'DOWN'|'ERROR'} state
 * @property {?number} http_code
 * @property {?string} page_title
 * @property {string} checked_at - ISO 8601 formatted date string.
 */

/**
 * @typedef {Object} Site
 * @property {string} domain
 * @property {string} config_file
 * @property {string} listen_port
 * @property {'proxy'|'static'|'unknown'} content_type
 * @property {SSLInfo} ssl
 * @property {ProxyInfo} proxy
 * @property {StaticInfo} static
 * @property {DockerInfo} docker
 * @property {StatusInfo} status
 */

/**
 * @typedef {Object} Statistics
 * @property {number} total_sites
 * @property {number} ssl_enabled_sites
 * @property {string} nginx_status
 * @property {number} docker_containers_running
 * @property {string} scan_date - ISO 8601 formatted date string.
 */

/**
 * @typedef {Object} NginxData
 * @property {Site[]} nginx_sites
 * @property {Statistics} statistics
 */


/**
 * @fileoverview Data fetching logic for the Nginx Sites dashboard.
 * This module is responsible for finding, downloading, and executing the backend script.
 */

const SCRIPT_PATH = "/usr/local/bin/nginx_info.sh";
const SCRIPT_URL = "https://gist.githubusercontent.com/AzerQ/9ef12f60e5752e57303cd27a6e46932c/raw/1a584009d3714942ab7cdb7707b122e2d7c24eee/nginx_sites_info.sh";

/**
 * Executes the helper script and returns a promise with the parsed JSON data.
 * @private
 * @returns {Promise<NginxData>} A promise that resolves with the Nginx data.
 */
function _runScript() {
    return new Promise((resolve, reject) => {
        cockpit.spawn([SCRIPT_PATH], { "superuser": "require" })
            .done(data => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    console.error("Invalid JSON received:", data);
                    reject({ title: "Data Parse Error", message: "Failed to parse JSON from script: " + e.message });
                }
            })
            .fail(err => reject({ title: "Script Execution Error", message: "Failed to execute helper script: " + err }));
    });
}

/**
 * Downloads the script, sets permissions, and then runs it.
 * @private
 * @returns {Promise<NginxData>} A promise that resolves with the Nginx data.
 */
function _downloadAndRunScript() {
    return new Promise((resolve, reject) => {
        cockpit.spawn(["curl", "-Ls", "-o", SCRIPT_PATH, SCRIPT_URL], { "superuser": "require" })
            .done(() => {
                cockpit.spawn(["chmod", "+x", SCRIPT_PATH], { "superuser": "require" })
                    .done(() => resolve(_runScript())) // Chain to run the script after successful download and chmod
                    .fail(err => reject({ title: "Script Permission Error", message: "Failed to set script permissions: " + err }));
            })
            .fail(err => reject({ title: "Download Failed", message: "Failed to download helper script: " + err }));
    });
}

/**
 * The main public function to get Nginx sites data.
 * It checks if the script exists and decides whether to run or download it first.
 * @returns {Promise<NginxData>} A promise that resolves with the complete Nginx data object.
 */
function fetchNginxData() {
    return new Promise((resolve, reject) => {
        cockpit.spawn(["test", "-f", SCRIPT_PATH], { "superuser": "require" })
            .done(() => resolve(_runScript())) // If script exists, run it
            .fail(() => resolve(_downloadAndRunScript())); // If script doesn't exist, download and then run
    });
}