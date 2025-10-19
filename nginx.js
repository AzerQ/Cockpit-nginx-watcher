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
 * @summary Shows the loading spinner overlay.
 * @returns {void}
 */
function showSpinner() {
    document.getElementById("loader-overlay")?.classList.remove("hidden");
}

/**
 * @summary Hides the loading spinner overlay.
 * @returns {void}
 */
function hideSpinner() {
    document.getElementById("loader-overlay")?.classList.add("hidden");
}

/**
 * @summary Orchestrates the process: check for script, download if needed, then execute.
 * @returns {void}
 */
function ensureScriptAndExecute() {
    showSpinner(); // Показываем спиннер в самом начале
    hideError();

    // Check if the script file exists
    cockpit.spawn(["test", "-f", SCRIPT_PATH], { "superuser": "require" })
        .done(runNginxScript) // Script exists, run it
        .fail(downloadScript); // Script does not exist, download it
}

/**
 * @summary Downloads the Nginx info script, makes it executable, and then runs it.
 * @returns {void}
 */
function downloadScript() {
    const curl_cmd = ["curl", "-Ls", "-o", SCRIPT_PATH, SCRIPT_URL];
    cockpit.spawn(curl_cmd, { "superuser": "require" })
        .done(() => {
            cockpit.spawn(["chmod", "+x", SCRIPT_PATH], { "superuser": "require" })
                .done(runNginxScript)
                .fail(err => {
                    showError("Failed to set script permissions: " + err);
                    hideSpinner(); // Прячем спиннер при ошибке
                });
        })
        .fail(err => {
            showError("Failed to download script: " + err);
            hideSpinner(); // Прячем спиннер при ошибке
        });
}

/**
 * @summary Executes the Nginx info script and triggers rendering of the results.
 * @returns {void}
 */
function runNginxScript() {
    cockpit.spawn([SCRIPT_PATH], { "superuser": "require" })
        .done(data => {
            try {
                /** @type {NginxData} */
                const jsonData = JSON.parse(data);
                renderStatistics(jsonData.statistics);
                renderSitesTable(jsonData.nginx_sites);
                hideError();
            } catch (e) {
                showError("Failed to parse JSON data from script: " + e.message);
                console.error("Invalid JSON received:", data);
            } finally {
                hideSpinner(); // Прячем спиннер после рендеринга
            }
        })
        .fail(err => {
            showError("Failed to execute script: " + err);
            hideSpinner(); // Прячем спиннер при ошибке
        });
}

/**
 * @summary Renders the summary statistics cards using PatternFly structure.
 * @param {Statistics} stats - The statistics object.
 * @returns {void}
 */
function renderStatistics(stats) {
    const container = document.getElementById("stats-container");
    if (!container) return;

    const nginxStatusClass = stats.nginx_status === 'active' ? 'status-ok' : 'status-error';
    container.innerHTML = `
        <div class="pf-l-grid__item pf-m-12-col pf-m-6-col-on-md pf-m-3-col-on-xl">
            <div class="pf-c-card"><div class="pf-c-card__body">
                <div class="stat-value">${stats.total_sites}</div>
                <div class="stat-label">Total Sites</div>
            </div></div>
        </div>
        <div class="pf-l-grid__item pf-m-12-col pf-m-6-col-on-md pf-m-3-col-on-xl">
            <div class="pf-c-card"><div class="pf-c-card__body">
                <div class="stat-value">${stats.ssl_enabled_sites}</div>
                <div class="stat-label">SSL Enabled</div>
            </div></div>
        </div>
        <div class="pf-l-grid__item pf-m-12-col pf-m-6-col-on-md pf-m-3-col-on-xl">
            <div class="pf-c-card"><div class="pf-c-card__body">
                <div class="stat-value ${nginxStatusClass}">${stats.nginx_status}</div>
                <div class="stat-label">Nginx Status</div>
            </div></div>
        </div>
        <div class="pf-l-grid__item pf-m-12-col pf-m-6-col-on-md pf-m-3-col-on-xl">
            <div class="pf-c-card"><div class="pf-c-card__body">
                <div class="stat-value">${stats.docker_containers_running}</div>
                <div class="stat-label">Docker Containers</div>
            </div></div>
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

    tbody.innerHTML = "";

    if (!sites || sites.length === 0) {
        tbody.innerHTML = '<tr role="row"><td role="cell" colspan="5"><div class="pf-c-empty-state"><div class="pf-c-empty-state__content"><h2 class="pf-c-title pf-m-lg">No sites found</h2><div class="pf-c-empty-state__body">Check your Nginx configuration.</div></div></div></td></tr>';
        return;
    }

    sites.forEach(site => {
        const row = document.createElement("tr");
        row.setAttribute("role", "row");

        const statusClass = site.status.state === 'UP' ? 'status-up' : 'status-error';
        const statusHtml = `<span class="status-indicator ${statusClass}"></span> ${site.status.state} (${site.status.http_code || 'N/A'})`;

        const protocol = site.ssl.enabled ? 'https' : 'http';
        const domainHtml = `
            <a href="${protocol}://${site.domain}" target="_blank" class="domain-link">${site.domain}</a>
            <div class="page-title">${site.status.page_title || 'No title'}</div>
        `;

        let targetHtml = '';
        if (site.content_type === 'proxy') {
            targetHtml = `<div><span class="pf-c-label pf-m-blue">Proxy</span></div><div class="target-path">${site.proxy.url}</div>`;
        } else if (site.content_type === 'static') {
            targetHtml = `<div><span class="pf-c-label pf-m-green">Static</span></div><div class="target-path">${site.static.root_path}</div>`;
        } else {
            targetHtml = `<div><span class="pf-c-label">Unknown</span></div>`;
        }

        const dockerHtml = site.docker.connected ? `<span class="docker-container">${site.docker.container}</span>` : '<i>N/A</i>';

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
            <td role="cell" data-label="Status">${statusHtml}</td>
            <td role="cell" data-label="Domain & Title">${domainHtml}</td>
            <td role="cell" data-label="Type & Target">${targetHtml}</td>
            <td role="cell" data-label="Docker Container">${dockerHtml}</td>
            <td role="cell" data-label="SSL Expiry">${sslHtml}</td>
        `;

        tbody.appendChild(row);
    });
}

/**
 * @summary Displays an error message in the error container.
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showError(message) {
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
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

// --- MAIN EXECUTION ---
document.addEventListener("DOMContentLoaded", function() {
    const refreshButton = document.getElementById("refresh-button");
    if (refreshButton) {
        refreshButton.addEventListener("click", ensureScriptAndExecute);
    }
    ensureScriptAndExecute();
});