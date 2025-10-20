//. @ts-check
/// <reference path="cockpit.d.js" />
/// <reference path="api.js" />

/**
 * @fileoverview Nginx configuration file editor with syntax highlighting.
 * Provides functionality to read, edit, and save nginx configuration files.
 */

/**
 * @typedef {Object} EditorInstance
 * @property {HTMLTextAreaElement} textarea - The textarea element
 * @property {HTMLElement} highlightedCode - The highlighted code display element
 * @property {string} configPath - Path to the configuration file being edited
 */

/** @type {?EditorInstance} */
let currentEditor = null;

/**
 * Nginx keywords for syntax highlighting
 * @type {string[]}
 */
const NGINX_KEYWORDS = [
    'server', 'location', 'http', 'events', 'upstream', 'if', 'return', 'rewrite',
    'listen', 'server_name', 'root', 'index', 'error_page', 'access_log', 'error_log',
    'proxy_pass', 'proxy_set_header', 'proxy_redirect', 'proxy_buffering',
    'ssl_certificate', 'ssl_certificate_key', 'ssl_protocols', 'ssl_ciphers',
    'ssl_prefer_server_ciphers', 'ssl_session_cache', 'ssl_session_timeout',
    'add_header', 'include', 'types', 'default_type', 'sendfile', 'keepalive_timeout',
    'gzip', 'gzip_types', 'gzip_vary', 'gzip_comp_level', 'client_max_body_size',
    'autoindex', 'try_files', 'fastcgi_pass', 'fastcgi_param', 'fastcgi_index',
    'worker_processes', 'worker_connections', 'user', 'pid', 'daemon'
];

/**
 * Nginx directives that commonly take specific values
 * @type {string[]}
 */
const NGINX_COMMON_VALUES = [
    'on', 'off', 'auto', 'default_server', 'http2', 'ssl', 'spdy',
    '$host', '$remote_addr', '$proxy_add_x_forwarded_for', '$scheme', '$request_uri',
    '$server_name', '$server_port', '$request_method', '$http_host'
];

/**
 * Reads a configuration file from the server.
 * @param {string} configPath - Path to the configuration file
 * @returns {Promise<string>} Promise that resolves with file content
 */
function readConfigFile(configPath) {
    return new Promise((resolve, reject) => {
        // First check if file exists
        cockpit.spawn(['test', '-f', configPath], { 'superuser': 'require', 'err': 'message' })
            .done(() => {
                // File exists, now try to read it
                cockpit.spawn(['cat', configPath], { 
                    'superuser': 'require',
                    'err': 'message'
                })
                .done(data => {
                    if (data && data.length > 0) {
                        resolve(data);
                    } else {
                        reject({ 
                            title: 'Read Error', 
                            message: `Configuration file "${configPath}" is empty` 
                        });
                    }
                })
                .fail((err, output) => {
                    console.error('cat command failed:', err, output);
                    reject({ 
                        title: 'Read Error', 
                        message: `Failed to read config file "${configPath}": ${err}\nOutput: ${output || 'none'}` 
                    });
                });
            })
            .fail((err, output) => {
                console.error('File check failed:', err, output);
                reject({ 
                    title: 'File Not Found', 
                    message: `Configuration file "${configPath}" does not exist or is not accessible.\nError: ${err}\nOutput: ${output || 'none'}` 
                });
            });
    });
}

/**
 * Saves a configuration file to the server.
 * @param {string} configPath - Path to the configuration file
 * @param {string} content - New file content
 * @returns {Promise<void>} Promise that resolves when save is complete
 */
function saveConfigFile(configPath, content) {
    return new Promise((resolve, reject) => {
        // First create a backup
        const backupPath = configPath + '.backup.' + Date.now();
        cockpit.spawn(['cp', configPath, backupPath], { 'superuser': 'require' })
            .done(() => {
                // Write new content
                const proc = cockpit.spawn(['tee', configPath], { 
                    'superuser': 'require',
                    'err': 'message'
                });
                proc.input(content);
                proc.done(() => {
                    // Test nginx configuration
                    cockpit.spawn(['nginx', '-t'], { 'superuser': 'require', 'err': 'message' })
                        .done(() => resolve())
                        .fail(err => {
                            // Restore backup if config test fails
                            cockpit.spawn(['mv', backupPath, configPath], { 'superuser': 'require' })
                                .always(() => reject({ 
                                    title: 'Configuration Error', 
                                    message: 'Nginx configuration test failed: ' + err + '\nOriginal file restored from backup.' 
                                }));
                        });
                })
                .fail(err => reject({ title: 'Write Error', message: 'Failed to write config file: ' + err }));
            })
            .fail(err => reject({ title: 'Backup Error', message: 'Failed to create backup: ' + err }));
    });
}

/**
 * Applies syntax highlighting to nginx configuration text.
 * @param {string} text - The nginx configuration text
 * @returns {string} HTML string with syntax highlighting
 */
function highlightNginxSyntax(text) {
    // Escape HTML first
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Highlight comments
    text = text.replace(/(#[^\n]*)/g, '<span class="syntax-comment">$1</span>');
    
    // Highlight strings (both single and double quoted)
    text = text.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="syntax-string">$1</span>');
    text = text.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="syntax-string">$1</span>');
    
    // Highlight numbers
    text = text.replace(/\b(\d+[kmg]?)\b/gi, '<span class="syntax-number">$1</span>');
    
    // Highlight keywords
    NGINX_KEYWORDS.forEach(keyword => {
        const regex = new RegExp('\\b(' + keyword + ')\\b', 'g');
        text = text.replace(regex, '<span class="syntax-keyword">$1</span>');
    });
    
    // Highlight common values
    NGINX_COMMON_VALUES.forEach(value => {
        const regex = new RegExp('\\b(' + value.replace(/\$/g, '\\$') + ')\\b', 'g');
        text = text.replace(regex, '<span class="syntax-value">$1</span>');
    });
    
    // Highlight variables
    text = text.replace(/(\$[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="syntax-variable">$1</span>');
    
    // Highlight block delimiters
    text = text.replace(/([{}])/g, '<span class="syntax-brace">$1</span>');
    
    // Highlight semicolons
    text = text.replace(/(;)/g, '<span class="syntax-semicolon">$1</span>');
    
    return text;
}

/**
 * Updates the syntax highlighting display.
 * @param {EditorInstance} editor - The editor instance
 */
function updateHighlighting(editor) {
    const text = editor.textarea.value;
    editor.highlightedCode.innerHTML = highlightNginxSyntax(text) + '\n';
}

/**
 * Synchronizes scroll positions between textarea and highlighted display.
 * @param {EditorInstance} editor - The editor instance
 */
function syncScroll(editor) {
    editor.highlightedCode.scrollTop = editor.textarea.scrollTop;
    editor.highlightedCode.scrollLeft = editor.textarea.scrollLeft;
}

/**
 * Handles Tab key for proper indentation.
 * @param {KeyboardEvent} e - The keyboard event
 * @param {EditorInstance} editor - The editor instance
 */
function handleTab(e, editor) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.textarea.selectionStart;
        const end = editor.textarea.selectionEnd;
        const value = editor.textarea.value;
        
        editor.textarea.value = value.substring(0, start) + '    ' + value.substring(end);
        editor.textarea.selectionStart = editor.textarea.selectionEnd = start + 4;
        updateHighlighting(editor);
    }
}

/**
 * Provides basic auto-completion suggestions.
 * @param {string} currentWord - The word being typed
 * @returns {string[]} Array of suggestions
 */
function getAutoCompleteSuggestions(currentWord) {
    if (!currentWord) return [];
    
    const suggestions = [];
    const lowerWord = currentWord.toLowerCase();
    
    // Add matching keywords
    NGINX_KEYWORDS.forEach(keyword => {
        if (keyword.toLowerCase().startsWith(lowerWord)) {
            suggestions.push(keyword);
        }
    });
    
    // Add matching common values
    NGINX_COMMON_VALUES.forEach(value => {
        if (value.toLowerCase().startsWith(lowerWord)) {
            suggestions.push(value);
        }
    });
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
}

/**
 * Shows auto-complete suggestions popup.
 * @param {EditorInstance} editor - The editor instance
 * @param {string[]} suggestions - Array of suggestions to show
 * @param {number} cursorPos - Current cursor position
 */
function showAutoComplete(editor, suggestions, cursorPos) {
    // Remove existing autocomplete if any
    const existing = document.getElementById('editor-autocomplete');
    if (existing) existing.remove();
    
    if (suggestions.length === 0) return;
    
    const popup = document.createElement('div');
    popup.id = 'editor-autocomplete';
    popup.className = 'editor-autocomplete-popup';
    
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            insertSuggestion(editor, suggestion);
            popup.remove();
        });
        popup.appendChild(item);
    });
    
    // Position popup
    const rect = editor.textarea.getBoundingClientRect();
    popup.style.top = (rect.top + 20) + 'px';
    popup.style.left = (rect.left + 10) + 'px';
    
    document.body.appendChild(popup);
}

/**
 * Inserts a suggestion at the cursor position.
 * @param {EditorInstance} editor - The editor instance
 * @param {string} suggestion - The suggestion to insert
 */
function insertSuggestion(editor, suggestion) {
    const start = editor.textarea.selectionStart;
    const value = editor.textarea.value;
    
    // Find the start of the current word
    let wordStart = start;
    while (wordStart > 0 && /[a-zA-Z_$]/.test(value[wordStart - 1])) {
        wordStart--;
    }
    
    editor.textarea.value = value.substring(0, wordStart) + suggestion + value.substring(start);
    editor.textarea.selectionStart = editor.textarea.selectionEnd = wordStart + suggestion.length;
    updateHighlighting(editor);
    editor.textarea.focus();
}

/**
 * Opens the configuration editor for a specific site.
 * @param {string} configPath - Path to the configuration file
 * @param {string} domain - Domain name (for display)
 */
async function openConfigEditor(configPath, domain) {
    try {
        // Show loading indicator
        showSpinner();
        
        // Read the configuration file
        const content = await readConfigFile(configPath);
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'config-editor-modal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Configuration: ${domain}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="editor-container">
                            <pre class="editor-highlight" id="editor-highlight"><code id="highlighted-code"></code></pre>
                            <textarea id="editor-textarea" class="editor-textarea" spellcheck="false"></textarea>
                        </div>
                        <div class="editor-info">
                            <small class="text-muted">File: ${configPath}</small>
                            <small class="text-muted ms-3">Press Tab for indentation, Ctrl+Space for auto-complete</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" id="editor-test-btn">Test Configuration</button>
                        <button type="button" class="btn btn-primary" id="editor-save-btn">Save & Reload Nginx</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Get elements
        const textarea = /** @type {HTMLTextAreaElement} */ (document.getElementById('editor-textarea'));
        const highlightedCode = /** @type {HTMLElement} */ (document.getElementById('highlighted-code'));
        
        if (!textarea || !highlightedCode) {
            throw new Error('Failed to initialize editor elements');
        }
        
        // Set content
        textarea.value = content;
        
        // Initialize editor instance
        currentEditor = {
            textarea: textarea,
            highlightedCode: highlightedCode,
            configPath: configPath
        };
        
        // Initial highlighting
        updateHighlighting(currentEditor);
        
        // Set up event listeners
        textarea.addEventListener('input', () => updateHighlighting(currentEditor));
        textarea.addEventListener('scroll', () => syncScroll(currentEditor));
        textarea.addEventListener('keydown', (e) => {
            handleTab(e, currentEditor);
            
            // Auto-complete on Ctrl+Space
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const value = textarea.value;
                let wordStart = start;
                while (wordStart > 0 && /[a-zA-Z_$]/.test(value[wordStart - 1])) {
                    wordStart--;
                }
                const currentWord = value.substring(wordStart, start);
                const suggestions = getAutoCompleteSuggestions(currentWord);
                showAutoComplete(currentEditor, suggestions, start);
            }
        });
        
        // Save button
        document.getElementById('editor-save-btn')?.addEventListener('click', async () => {
            try {
                showSpinner();
                await saveConfigFile(configPath, textarea.value);
                
                // Reload nginx
                await new Promise((resolve, reject) => {
                    cockpit.spawn(['nginx', '-s', 'reload'], { 'superuser': 'require' })
                        .done(() => resolve(undefined))
                        .fail(err => reject({ title: 'Reload Error', message: 'Failed to reload Nginx: ' + err }));
                });
                
                // Close modal
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
                
                // Refresh data
                await handleRefresh();
                
                alert('Configuration saved and Nginx reloaded successfully!');
            } catch (error) {
                alert(error.title + ': ' + error.message);
            } finally {
                hideSpinner();
            }
        });
        
        // Test button
        document.getElementById('editor-test-btn')?.addEventListener('click', async () => {
            try {
                showSpinner();
                
                // Save to a temporary file first
                const tempPath = '/tmp/nginx-test-' + Date.now() + '.conf';
                const proc = cockpit.spawn(['tee', tempPath], { 'superuser': 'require' });
                proc.input(textarea.value);
                
                await new Promise((resolve, reject) => {
                    proc.done(() => {
                        // Test the temporary file
                        cockpit.spawn(['nginx', '-t', '-c', tempPath], { 'superuser': 'require', 'err': 'message' })
                            .done(() => {
                                cockpit.spawn(['rm', tempPath], { 'superuser': 'require' })
                                    .always(() => resolve(undefined));
                            })
                            .fail(err => {
                                cockpit.spawn(['rm', tempPath], { 'superuser': 'require' })
                                    .always(() => reject({ title: 'Test Failed', message: err }));
                            });
                    })
                    .fail(err => reject({ title: 'Write Error', message: 'Failed to write temp file: ' + err }));
                });
                
                alert('Configuration test passed! ✓');
            } catch (error) {
                alert(error.title + ': ' + error.message);
            } finally {
                hideSpinner();
            }
        });
        
        // Clean up on modal close
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
            currentEditor = null;
        });
        
        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        hideSpinner();
    } catch (error) {
        hideSpinner();
        showError(error.title, error.message);
    }
}
