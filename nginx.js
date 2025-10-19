/// <reference path="cockpit.d.js" />
//. @ts-check

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


// Constants
/**
 * @const {string} SCRIPT_PATH
 * @description The absolute path where the info script should be located.
 */
const SCRIPT_PATH = "/usr/local/bin/nginx_info.sh";

/**
 * @const {string} SCRIPT_URL
 * @description The URL to download the script from if it's not found locally.
 */
const SCRIPT_URL = "https://gist.githubusercontent.com/AzerQ/9ef12f60e5752e57303cd27a6e46932c/raw/1a584009d3714942ab7cdb7707b122e2d7c24eee/nginx_sites_info.sh";

/**
 * @summary Initializes the component when the page loads.
 * @description Attaches event listeners and triggers the initial data load.
 * @returns {void}
 */
function init() {
    cockpit.ready(function() {
        // Run initial data load
        ensureScriptAndExecute();

        // Add listener to the refresh button
        const refreshButton = document.getElementById("refresh-button");
        if (refreshButton) {
            refreshButton.addEventListener("click", ensureScriptAndExecute);
        }
    });
}

/**
 * @summary Orchestrates the process: check for script, download if needed, then execute.
 * @returns {void}
 */
function ensureScriptAndExecute() {
    showLoading("Checking for script...");
    hideError();

    // Check if the script file exists
    cockpit.spawn(["test", "-f", SCRIPT_PATH], { "superuser": "require" })
        .done(function() {
            // Script exists, run it
            runNginxScript();
        })
        .fail(function() {
            // Script does not exist, download it
            downloadScript();
        });
}

/**
 * @summary Downloads the Nginx info script, makes it executable, and then runs it.
 * @returns {void}
 */
function downloadScript() {
    showLoading("Downloading script...");
    const curl_cmd = ["curl", "-Ls", "-o", SCRIPT_PATH, SCRIPT_URL];

    cockpit.spawn(curl_cmd, { "superuser": "require" })
        .done(function() {
            showLoading("Setting permissions...");
            // Make the script executable
            cockpit.spawn(["chmod", "+x", SCRIPT_PATH], { "superuser": "require" })
                .done(function() {
                    // Now that the script is ready, run it
                    runNginxScript();
                })
                .fail(function(err) {
                    showError("Failed to set script permissions: " + err);
                });
        })
        .fail(function(err) {
            showError("Failed to download script: " + err);
        });
}

/**
 * @summary Executes the Nginx info script and triggers rendering of the results.
 * @returns {void}
 */
function runNginxScript() {
    showLoading("Fetching Nginx data...");
    cockpit.spawn([SCRIPT_PATH], { "superuser": "require" })
        .done(function(data) {
            try {
                /** @type {NginxData} */
                const jsonData = JSON.parse(data);
                renderStatistics(jsonData.statistics);
                renderSitesTable(jsonData.nginx_sites);
                hideError();
            } catch (e) {
                showError("Failed to parse JSON data from script: " + e.message);
                console.error("Invalid JSON received:", data);
            }
        })
        .fail(function(err) {
            showError("Failed to execute script: " + err);
        });
}

/**
 * @summary Renders the summary statistics cards.
 * @param {Statistics} stats - The statistics object from the script output.
 * @returns {void}
 */
function renderStatistics(stats) {
    const container = document.getElementById("stats-container");
    if (!container) return;

    const nginxStatusClass = stats.nginx_status === 'active' ? 'status-ok' : 'status-error';
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total_sites}</div>
            <div class="stat-label">Total Sites</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.ssl_enabled_sites}</div>
            <div class="stat-label">SSL Enabled</div>
        </div>
        <div class="stat-card">
            <div class="stat-value ${nginxStatusClass}">${stats.nginx_status}</div>
            <div class="stat-label">Nginx Status</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.docker_containers_running}</div>
            <div class="stat-label">Docker Containers</div>
        </div>
    `;
}

/**
 * @summary Renders the main table with the list of Nginx sites.
 * @param {Site[]} sites - An array of site objects.
 * @returns {void}
 */
function renderSitesTable(sites) {
    const tbody = document.getElementById("sites-tbody");
    if (!tbody) return;

    tbody.innerHTML = ""; // Clear the table before updating

    if (!sites || sites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No sites found in Nginx configuration.</td></tr>';
        return;
    }

    sites.forEach(site => {
        const row = document.createElement("tr");

        // --- Status Column ---
        const statusClass = site.status.state === 'UP' ? 'status-up' : (site.status.state === 'ERROR' ? 'status-error' : 'status-down');
        const statusHtml = `<span class="status-indicator ${statusClass}"></span> ${site.status.state} (${site.status.http_code || 'N/A'})`;

        // --- Domain & Title Column ---
        const protocol = site.ssl.enabled ? 'https' : 'http';
        const domainHtml = `
            <a href="${protocol}://${site.domain}" target="_blank" class="domain-link">${site.domain}</a>
            <div class="page-title">${site.status.page_title || 'No title'}</div>
        `;

        // --- Type & Target Column ---
        let targetHtml = '';
        if (site.content_type === 'proxy') {
            targetHtml = `<span class="label-proxy">Proxy</span> <span class="target-path">${site.proxy.url}</span>`;
        } else if (site.content_type === 'static') {
            targetHtml = `<span class="label-static">Static</span> <span class="target-path">${site.static.root_path}</span>`;
        } else {
            targetHtml = '<span class="label-unknown">Unknown</span>';
        }

        // --- Docker Column ---
        const dockerHtml = site.docker.connected ? `<span class="docker-container">${site.docker.container}</span>` : '<i>N/A</i>';

        // --- SSL Expiry Column ---
        let sslHtml = '<i>Disabled</i>';
        if (site.ssl.enabled && site.ssl.expiry_date) {
            const expiryDate = new Date(site.ssl.expiry_date);
            const now = new Date();
            const daysLeft = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            const dateString = expiryDate.toLocaleDateString();

            let expiryClass = 'ssl-ok';
            if (daysLeft < 14) expiryClass = 'ssl-critical';
            else if (daysLeft < 30) expiryClass = 'ssl-warning';

            sslHtml = `<div class="${expiryClass}">${dateString} <span>(${daysLeft} days left)</span></div>`;
        }

        row.innerHTML = `
            <td>${statusHtml}</td>
            <td>${domainHtml}</td>
            <td>${targetHtml}</td>
            <td>${dockerHtml}</td>
            <td>${sslHtml}</td>
        `;

        tbody.appendChild(row);
    });
}

/**
 * @summary Displays a loading message in the table body.
 * @param {string} [message="Loading data..."] - The message to display.
 * @returns {void}
 */
function showLoading(message = "Loading data...") {
    const tbody = document.getElementById("sites-tbody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${message}</td></tr>`;
    }
}

/**
 * @summary Displays an error message in the error container.
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showError(message) {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove("hidden");
    }
}

/**
 * @summary Hides the error message container.
 * @returns {void}
 */
function hideError() {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
        errorContainer.classList.add("hidden");
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);