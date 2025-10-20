# Nginx Config Editor - Features Overview

## Overview

The Nginx Config Editor is a powerful component built using CodeMirror 5.65.16 that provides professional-grade editing capabilities for nginx configuration files directly within the Cockpit interface.

## Key Features

### 1. Syntax Highlighting

The editor provides comprehensive syntax highlighting for nginx configuration files:

- **Directives**: `server`, `location`, `listen`, `server_name`, etc. are highlighted
- **Keywords**: Control structures like `if`, `return`, `rewrite` are color-coded
- **Strings**: Quoted strings are visually distinct
- **Comments**: Single-line and multi-line comments are highlighted
- **Numbers**: Port numbers and values are highlighted
- **Variables**: Nginx variables like `$remote_addr`, `$host` are highlighted

### 2. Autocompletion

Context-aware autocompletion helps you write configurations faster:

- **67 nginx directives** pre-configured for autocompletion
- Trigger manually with `Ctrl+Space`
- Automatic suggestions as you type
- Filtered suggestions based on current input
- Common directives included:
  - Server blocks: `server`, `listen`, `server_name`, `root`, `index`
  - Location blocks: `location`, `try_files`, `alias`, `return`, `rewrite`
  - Proxy: `proxy_pass`, `proxy_set_header`, `proxy_redirect`, `proxy_buffering`
  - SSL: `ssl_certificate`, `ssl_certificate_key`, `ssl_protocols`, `ssl_ciphers`
  - FastCGI: `fastcgi_pass`, `fastcgi_param`
  - Headers: `add_header`
  - Compression: `gzip`, `gzip_types`, `gzip_comp_level`
  - Limits: `limit_rate`, `limit_conn`, `limit_req`
  - Access control: `allow`, `deny`, `auth_basic`
  - Performance: `sendfile`, `tcp_nopush`, `tcp_nodelay`, `keepalive_timeout`

### 3. File Management

Easy navigation and management of nginx configuration files:

- **Automatic discovery** of all `.conf` files in `/etc/nginx/`
- **Organized by category**:
  - Main Configuration (nginx.conf)
  - Sites Available
  - Sites Enabled
  - Other Configs
- **File selector dropdown** for quick switching between files
- **Current path display** showing the active file

### 4. Editor Features

Professional code editor capabilities:

- **Line numbers** for easy reference and debugging
- **Active line highlighting** to show your current position
- **Bracket matching** to help with nested blocks
- **Smart indentation** with configurable tab size (4 spaces)
- **Monospace font** for clear code alignment
- **600px height** editor with scrolling for large files

### 5. Configuration Testing

Safe configuration management:

- **Test Config** button validates syntax before saving
- Runs `nginx -t` to check for errors
- Displays test results with clear success/error indicators
- Prevents invalid configurations from being saved

### 6. Nginx Control

Direct nginx service management:

- **Reload Nginx** button for applying changes
- Automatic configuration test before reload
- Safe reload using `systemctl reload nginx`
- Error handling with clear messages

### 7. Keyboard Shortcuts

Efficient editing with keyboard shortcuts:

- `Ctrl+S` - Save current configuration
- `Ctrl+Space` - Trigger autocompletion manually
- `Tab` - Indent selected lines
- `Shift+Tab` - Unindent selected lines

### 8. Visual Feedback

Clear user interface with feedback:

- **Loading spinner** during operations
- **Success messages** (auto-hide after 5 seconds)
- **Error messages** with clear descriptions
- **Status output** showing test results
- **Styled test output** with color-coded borders (green for success, red for errors)

## Technical Implementation

### CodeMirror Configuration

```javascript
{
    mode: 'nginx',              // Nginx syntax mode
    lineNumbers: true,          // Show line numbers
    theme: 'default',           // Default theme
    indentUnit: 4,             // 4-space indentation
    tabSize: 4,                // Tab = 4 spaces
    indentWithTabs: false,     // Use spaces, not tabs
    lineWrapping: false,       // No line wrap
    matchBrackets: true,       // Highlight matching brackets
    styleActiveLine: true,     // Highlight active line
    extraKeys: {
        "Ctrl-Space": "autocomplete",  // Manual autocomplete
        "Ctrl-S": function(cm) {       // Save shortcut
            saveConfig();
        }
    }
}
```

### Security

All operations require sudo privileges:
- Reading configuration files
- Writing configuration changes
- Testing nginx configuration
- Reloading nginx service

Permissions are managed through the Cockpit API's `superuser: 'require'` option.

## Usage Example

1. **Open the editor**: Navigate to "Config Editor" in the Cockpit menu
2. **Select a file**: Choose a configuration file from the dropdown (e.g., "example.com")
3. **Edit**: Start typing - autocompletion will suggest directives
4. **Test**: Click "Test Config" to validate your changes
5. **Save**: Click "Save Changes" to write to disk
6. **Reload**: Click "Reload Nginx" to apply changes (tests automatically)

## Browser Compatibility

Works in all modern browsers that Cockpit supports:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## File Organization

```
Cockpit-nginx-watcher/
├── config-editor.html      # Main HTML page
├── config-editor.js        # Editor logic and API integration
├── config-editor.css       # Custom styling
├── lib/
│   ├── codemirror.js       # CodeMirror core
│   ├── codemirror.css      # CodeMirror base styles
│   ├── nginx-mode.js       # Nginx syntax mode
│   ├── show-hint.js        # Autocompletion addon
│   ├── show-hint.css       # Autocompletion styles
│   ├── anyword-hint.js     # Word-based hints
│   └── active-line.js      # Active line highlighting
```

## Future Enhancements

Potential features for future versions:
- Syntax validation in real-time
- Configuration snippets library
- Multiple file editing (tabs)
- Diff view for configuration changes
- Configuration backup and restore
- Search and replace
- Themes (dark mode)
- Configuration templates
