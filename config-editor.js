//. @ts-check
/// <reference path="cockpit.d.js" />

/**
 * @fileoverview Nginx configuration editor with CodeMirror
 * This module provides syntax highlighting and autocompletion for nginx configs.
 */

let editor;
let currentConfigFile = '';
let configFiles = [];

// Nginx directives and keywords for autocompletion
const nginxKeywords = [
    'server', 'location', 'http', 'events', 'upstream', 'if', 'return', 'rewrite',
    'listen', 'server_name', 'root', 'index', 'error_page', 'access_log', 'error_log',
    'proxy_pass', 'proxy_set_header', 'proxy_redirect', 'proxy_buffering',
    'ssl_certificate', 'ssl_certificate_key', 'ssl_protocols', 'ssl_ciphers',
    'add_header', 'fastcgi_pass', 'fastcgi_param', 'include', 'types',
    'gzip', 'gzip_types', 'gzip_comp_level', 'client_max_body_size',
    'keepalive_timeout', 'send_timeout', 'proxy_connect_timeout',
    'proxy_send_timeout', 'proxy_read_timeout', 'worker_processes',
    'worker_connections', 'sendfile', 'tcp_nopush', 'tcp_nodelay',
    'resolver', 'resolver_timeout', 'charset', 'default_type',
    'autoindex', 'autoindex_exact_size', 'autoindex_localtime',
    'limit_rate', 'limit_conn', 'limit_req', 'allow', 'deny',
    'auth_basic', 'auth_basic_user_file', 'try_files', 'alias',
    'expires', 'etag', 'if_modified_since', 'log_format',
    'access_log', 'open_log_file_cache', 'ssl_session_cache',
    'ssl_session_timeout', 'ssl_prefer_server_ciphers'
];

/**
 * Initialize CodeMirror editor
 */
function initializeEditor() {
    const textarea = document.getElementById('code-editor');
    
    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'nginx',
        lineNumbers: true,
        theme: 'default',
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: false,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-S": function(cm) {
                saveConfig();
            }
        },
        hintOptions: {
            hint: customNginxHint,
            completeSingle: false
        }
    });

    // Enable autocomplete on input
    editor.on("inputRead", function(cm, change) {
        if (change.text[0] && /[a-z_]/i.test(change.text[0])) {
            CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
        }
    });
}

/**
 * Custom hint function for nginx directives
 */
function customNginxHint(cm) {
    const cur = cm.getCursor();
    const curLine = cm.getLine(cur.line);
    let start = cur.ch;
    let end = cur.ch;
    
    // Find word boundaries
    while (start && /[a-z_]/i.test(curLine.charAt(start - 1))) start--;
    while (end < curLine.length && /[a-z_]/i.test(curLine.charAt(end))) end++;
    
    const word = curLine.slice(start, end).toLowerCase();
    
    // Filter keywords that match the current word
    const matches = nginxKeywords.filter(kw => 
        kw.toLowerCase().startsWith(word)
    );
    
    if (matches.length === 0) {
        // Fall back to anyword hint
        return CodeMirror.hint.anyword(cm);
    }
    
    return {
        list: matches,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
    };
}

/**
 * Load list of nginx config files
 */
async function loadConfigFileList() {
    try {
        showSpinner();
        const result = await cockpit.spawn([
            'find', '/etc/nginx', '-type', 'f', 
            '-name', '*.conf', '-o', '-name', 'nginx.conf'
        ], { superuser: 'require' });
        
        configFiles = result.trim().split('\n').filter(f => f);
        
        const select = document.getElementById('config-select');
        select.innerHTML = '';
        
        if (configFiles.length === 0) {
            select.innerHTML = '<option value="">No config files found</option>';
            return;
        }
        
        // Add main nginx.conf first
        const mainConf = configFiles.find(f => f === '/etc/nginx/nginx.conf');
        if (mainConf) {
            const option = document.createElement('option');
            option.value = mainConf;
            option.textContent = 'nginx.conf (main)';
            select.appendChild(option);
        }
        
        // Add sites-available configs
        const sitesAvailable = configFiles.filter(f => f.includes('/sites-available/'));
        if (sitesAvailable.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Sites Available';
            sitesAvailable.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file.split('/').pop();
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
        
        // Add sites-enabled configs
        const sitesEnabled = configFiles.filter(f => f.includes('/sites-enabled/'));
        if (sitesEnabled.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Sites Enabled';
            sitesEnabled.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file.split('/').pop();
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
        
        // Add other configs
        const otherConfigs = configFiles.filter(f => 
            !f.includes('/sites-available/') && 
            !f.includes('/sites-enabled/') && 
            f !== '/etc/nginx/nginx.conf'
        );
        if (otherConfigs.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Other Configs';
            otherConfigs.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file.replace('/etc/nginx/', '');
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
        
        // Load the first file
        if (configFiles.length > 0) {
            select.value = configFiles[0];
            await loadConfigFile(configFiles[0]);
        }
        
    } catch (error) {
        showError('Error Loading Config List', error.toString());
    } finally {
        hideSpinner();
    }
}

/**
 * Load a specific config file
 */
async function loadConfigFile(filePath) {
    try {
        showSpinner();
        hideError();
        hideSuccess();
        
        const content = await cockpit.file(filePath, { superuser: 'require' }).read();
        
        if (content === null) {
            throw new Error('File not found or cannot be read');
        }
        
        editor.setValue(content);
        currentConfigFile = filePath;
        
        document.getElementById('config-path').textContent = filePath;
        
    } catch (error) {
        showError('Error Loading File', error.toString());
    } finally {
        hideSpinner();
    }
}

/**
 * Save the current config file
 */
async function saveConfig() {
    if (!currentConfigFile) {
        showError('Error', 'No file selected');
        return;
    }
    
    try {
        showSpinner();
        hideError();
        hideSuccess();
        
        const content = editor.getValue();
        const file = cockpit.file(currentConfigFile, { superuser: 'require' });
        await file.replace(content);
        
        showSuccess('Success', `Configuration saved to ${currentConfigFile}`);
        
    } catch (error) {
        showError('Error Saving File', error.toString());
    } finally {
        hideSpinner();
    }
}

/**
 * Test nginx configuration
 */
async function testConfig() {
    try {
        showSpinner();
        hideError();
        hideSuccess();
        clearStatus();
        
        const result = await cockpit.spawn(['nginx', '-t'], { 
            superuser: 'require',
            err: 'out'
        });
        
        showStatusOutput(result, true);
        
    } catch (error) {
        const output = error.toString();
        showStatusOutput(output, false);
    } finally {
        hideSpinner();
    }
}

/**
 * Reload nginx
 */
async function reloadNginx() {
    try {
        showSpinner();
        hideError();
        hideSuccess();
        clearStatus();
        
        // First test the config
        await cockpit.spawn(['nginx', '-t'], { 
            superuser: 'require',
            err: 'out'
        });
        
        // If test passes, reload
        await cockpit.spawn(['systemctl', 'reload', 'nginx'], { 
            superuser: 'require'
        });
        
        showSuccess('Success', 'Nginx reloaded successfully');
        
    } catch (error) {
        showError('Error Reloading Nginx', error.toString());
    } finally {
        hideSpinner();
    }
}

/**
 * Show status output
 */
function showStatusOutput(output, isSuccess) {
    const statusContainer = document.getElementById('status-container');
    const div = document.createElement('div');
    div.className = `test-output ${isSuccess ? 'success' : 'error'}`;
    div.textContent = output;
    statusContainer.innerHTML = '';
    statusContainer.appendChild(div);
}

/**
 * Clear status output
 */
function clearStatus() {
    document.getElementById('status-container').innerHTML = '';
}

/**
 * Show loading spinner
 */
function showSpinner() {
    document.getElementById('loader-overlay')?.classList.remove('d-none');
}

/**
 * Hide loading spinner
 */
function hideSpinner() {
    document.getElementById('loader-overlay')?.classList.add('d-none');
}

/**
 * Show error message
 */
function showError(title, message) {
    const errorContainer = document.getElementById('error-container');
    const errorTitle = document.getElementById('error-title');
    const errorMessage = document.getElementById('error-message');
    
    if (errorContainer && errorTitle && errorMessage) {
        errorTitle.textContent = title;
        errorMessage.textContent = message;
        errorContainer.classList.remove('d-none');
    }
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('error-container')?.classList.add('d-none');
}

/**
 * Show success message
 */
function showSuccess(title, message) {
    const successContainer = document.getElementById('success-container');
    const successTitle = document.getElementById('success-title');
    const successMessage = document.getElementById('success-message');
    
    if (successContainer && successTitle && successMessage) {
        successTitle.textContent = title;
        successMessage.textContent = message;
        successContainer.classList.remove('d-none');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideSuccess();
        }, 5000);
    }
}

/**
 * Hide success message
 */
function hideSuccess() {
    document.getElementById('success-container')?.classList.add('d-none');
}

// --- MAIN EXECUTION ---
document.addEventListener('DOMContentLoaded', function() {
    // Initialize editor
    initializeEditor();
    
    // Load config files list
    loadConfigFileList();
    
    // Event listeners
    document.getElementById('config-select')?.addEventListener('change', function(e) {
        const filePath = e.target.value;
        if (filePath) {
            loadConfigFile(filePath);
        }
    });
    
    document.getElementById('save-button')?.addEventListener('click', saveConfig);
    document.getElementById('test-config-button')?.addEventListener('click', testConfig);
    document.getElementById('reload-nginx-button')?.addEventListener('click', reloadNginx);
});
