//. @ts-check
/// <reference path="cockpit.d.js" />
/// <reference path="api.js" />

/**
 * @fileoverview UI rendering logic for the Nginx Sites dashboard.
 * This module handles all DOM manipulations.
 */

/** @summary Shows the loading spinner overlay. */
function showSpinner() {
    document.getElementById("loader-overlay")?.classList.remove("d-none");
}

/** @summary Hides the loading spinner overlay. */
function hideSpinner() {
    document.getElementById("loader-overlay")?.classList.add("d-none");
}

/** @summary Renders the summary statistics cards. */
function renderStatistics(stats) {
    const container = document.getElementById("stats-container");
    if (!container) return;
    const nginxStatusClass = stats.nginx_status === 'active' ? 'status-ok' : 'status-error';
    container.innerHTML = `
        <div class="col"><div class="card h-100"><div class="card-body text-center">
            <div class="stat-value">${stats.total_sites}</div><div class="stat-label">Total Sites</div>
        </div></div></div>
        <div class="col"><div class="card h-100"><div class="card-body text-center">
            <div class="stat-value">${stats.ssl_enabled_sites}</div><div class="stat-label">SSL Enabled</div>
        </div></div></div>
        <div class="col"><div class="card h-100"><div class="card-body text-center">
            <div class="stat-value ${nginxStatusClass}">${stats.nginx_status}</div><div class="stat-label">Nginx Status</div>
        </div></div></div>
        <div class="col"><div class="card h-100"><div class="card-body text-center">
            <div class="stat-value">${stats.docker_containers_running}</div><div class="stat-label">Docker Containers</div>
        </div></div></div>
    `;
}

/** @summary Renders the main table with site data. */
function renderSitesTable(sites) {
    const tbody = document.getElementById("sites-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!sites || sites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-5"><h4>No sites found</h4><p class="text-muted">Check your Nginx configuration.</p></td></tr>';
        return;
    }
    sites.forEach(site => {
        const row = document.createElement("tr");
        const statusClass = site.status.state === 'UP' ? 'status-up' : 'status-error';
        const statusHtml = `<span class="status-indicator ${statusClass}"></span> ${site.status.state} (${site.status.http_code || 'N/A'})`;
        const protocol = site.ssl.enabled ? 'https' : 'http';
        const domainHtml = `<a href="${protocol}://${site.domain}" target="_blank" class="domain-link">${site.domain}</a><div class="page-title">${site.status.page_title || 'No title'}</div>`;
        let targetHtml = '';
        if (site.content_type === 'proxy') {
            targetHtml = `<div><span class="badge bg-primary">Proxy</span></div><div class="target-path mt-1">${site.proxy.url}</div>`;
        } else if (site.content_type === 'static') {
            targetHtml = `<div><span class="badge bg-success">Static</span></div><div class="target-path mt-1">${site.static.root_path}</div>`;
        } else {
            targetHtml = `<div><span class="badge bg-secondary">Unknown</span></div>`;
        }
        const dockerHtml = site.docker.connected ? `<span class="docker-container">${site.docker.container}</span>` : '<span class="text-muted">N/A</span>';
        let sslHtml = '<span class="text-muted">Disabled</span>';
        if (site.ssl.enabled && site.ssl.expiry_date) {
            const expiryDate = new Date(site.ssl.expiry_date);
            const now = new Date();
            const daysLeft = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            const dateString = expiryDate.toLocaleDateString();
            let expiryClass = 'ssl-ok';
            if (daysLeft < 14) expiryClass = 'ssl-critical';
            else if (daysLeft < 30) expiryClass = 'ssl-warning';
            sslHtml = `<div class="${expiryClass}">${dateString} <span>(${daysLeft} days)</span></div>`;
        }
        const actionsHtml = `<button class="btn btn-sm btn-primary btn-edit" data-config="${site.config_file}" data-domain="${site.domain}">
            <i class="bi bi-pencil"></i> Edit
        </button>`;
        row.innerHTML = `
            <td>${statusHtml}</td><td>${domainHtml}</td><td>${targetHtml}</td>
            <td>${dockerHtml}</td><td>${sslHtml}</td><td>${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const configFile = this.getAttribute('data-config');
            const domain = this.getAttribute('data-domain');
            if (configFile && domain && typeof openConfigEditor !== 'undefined') {
                openConfigEditor(configFile, domain);
            }
        });
    });
}

/** @summary Displays an error message. */
function showError(title, message) {
    const errorContainer = document.getElementById("error-container");
    const errorTitle = document.getElementById("error-title");
    const errorMessage = document.getElementById("error-message");
    if (errorContainer && errorTitle && errorMessage) {
        errorTitle.textContent = title;
        errorMessage.textContent = message;
        errorContainer.classList.remove("d-none");
    }
}

/** @summary Hides the error message. */
function hideError() {
    document.getElementById("error-container")?.classList.add("d-none");
}

/**
 * @summary Main handler for fetching and displaying data.
 */
async function handleRefresh() {
    showSpinner();
    hideError();

    try {
        const data = await fetchNginxData(); // Call the API
        renderStatistics(data.statistics);
        renderSitesTable(data.nginx_sites);
    } catch (error) {
        showError(error.title, error.message);
    } finally {
        hideSpinner();
    }
}

// --- MAIN EXECUTION ---
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("refresh-button")?.addEventListener("click", handleRefresh);
    handleRefresh(); // Initial data load
});