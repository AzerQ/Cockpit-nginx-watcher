# Nginx Configuration Editor

This component provides a powerful nginx configuration editor with syntax highlighting and autocompletion using CodeMirror.

## Features

### Syntax Highlighting
- Full nginx configuration syntax highlighting
- Color-coded directives, keywords, strings, and comments
- Visual distinction between different configuration elements

### Autocompletion
- Context-aware autocompletion for nginx directives
- Trigger with `Ctrl+Space` or automatically while typing
- Supports common nginx directives including:
  - Server blocks: `server`, `listen`, `server_name`, `root`, `index`
  - Location blocks: `location`, `try_files`, `alias`
  - Proxy directives: `proxy_pass`, `proxy_set_header`, `proxy_redirect`
  - SSL directives: `ssl_certificate`, `ssl_certificate_key`, `ssl_protocols`
  - FastCGI directives: `fastcgi_pass`, `fastcgi_param`
  - And many more...

### Editor Features
- Line numbers for easy reference
- Active line highlighting
- Bracket matching
- Keyboard shortcuts:
  - `Ctrl+S`: Save configuration
  - `Ctrl+Space`: Trigger autocompletion

### Configuration Management
- Browse all nginx configuration files in `/etc/nginx/`
- Organized by category:
  - Main configuration (`nginx.conf`)
  - Sites Available
  - Sites Enabled
  - Other configs
- Load and edit any configuration file
- Save changes directly from the editor

### Testing and Deployment
- **Test Config**: Validates nginx configuration syntax before saving
- **Reload Nginx**: Safely reloads nginx after configuration changes
- **Save Changes**: Persists configuration changes to disk

## Usage

1. Navigate to **Config Editor** in the Cockpit menu
2. Select a configuration file from the dropdown
3. Edit the configuration with syntax highlighting and autocompletion
4. Test your changes with the "Test Config" button
5. Save your changes with the "Save Changes" button
6. Reload nginx with the "Reload Nginx" button (automatically tests first)

## Technical Details

- **Library**: CodeMirror 5.65.16
- **Mode**: nginx
- **Addons**: 
  - show-hint (autocompletion)
  - anyword-hint (context-aware suggestions)
  - active-line (current line highlighting)

## Files

- `config-editor.html` - Main HTML page
- `config-editor.js` - Editor logic and API integration
- `config-editor.css` - Custom styling
- `lib/codemirror.js` - CodeMirror core library
- `lib/nginx-mode.js` - Nginx syntax mode
- `lib/show-hint.js` - Autocompletion addon
- `lib/anyword-hint.js` - Context-aware hints
- `lib/active-line.js` - Active line highlighting

## Keyboard Shortcuts

- `Ctrl+S` - Save current configuration
- `Ctrl+Space` - Trigger autocompletion
- `Tab` - Indent selected lines
- `Shift+Tab` - Unindent selected lines

## Security

The editor requires sudo privileges to:
- Read nginx configuration files
- Write configuration changes
- Test nginx configuration
- Reload nginx service

All operations are performed securely through the Cockpit API.
