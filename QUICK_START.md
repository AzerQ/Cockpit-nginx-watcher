# Quick Start Guide - Nginx Config Editor

## Accessing the Editor

1. Open Cockpit web interface (usually at `https://your-server:9090`)
2. Log in with your credentials
3. Look for **"Config Editor"** in the left sidebar menu
4. Click to open the editor

## Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Nginx Configuration Editor                                 │
│  [Test Config] [Reload Nginx] [Save Changes]                │
├─────────────────────────────────────────────────────────────┤
│  Select Configuration File: [▼ dropdown]                     │
│  Current Path: /etc/nginx/nginx.conf                        │
├─────────────────────────────────────────────────────────────┤
│  1  # Nginx Configuration                                   │
│  2  server {                                                 │
│  3      listen 80;                                           │
│  4      server_name example.com;                             │
│  5      root /var/www/html;                                  │
│  6  }                                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Basic Workflow

### 1. Select a Configuration File

Click the dropdown menu to choose a file to edit:
- **nginx.conf (main)** - Main nginx configuration
- **Sites Available** - Available site configurations
- **Sites Enabled** - Active site configurations
- **Other Configs** - Additional configuration files

### 2. Edit the Configuration

- Type directly in the editor
- Use syntax highlighting to identify elements
- Use autocompletion (Ctrl+Space) for nginx directives

### 3. Test Your Changes

Click **"Test Config"** button to validate:
```
✓ nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
✓ nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4. Save Changes

- Click **"Save Changes"** button, or
- Press **Ctrl+S** keyboard shortcut

Success message will appear and auto-hide after 5 seconds.

### 5. Apply Changes

Click **"Reload Nginx"** to apply:
- Automatically tests config first
- Reloads nginx service if test passes
- Shows error if test fails

## Using Autocompletion

### Automatic Suggestions

Just start typing:
```
Type: ser
Suggestions:
  → server
    server_name
    server_tokens
```

### Manual Trigger

Press **Ctrl+Space** to show suggestions at any time.

### Navigation

- **↓** or **↑** - Move through suggestions
- **Enter** - Accept selected suggestion
- **Esc** - Close suggestion menu

## Common Nginx Directives

### Server Block
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;
}
```

### Location Block
```nginx
location / {
    try_files $uri $uri/ =404;
}
```

### Proxy Configuration
```nginx
location /api/ {
    proxy_pass http://localhost:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### SSL Configuration
```nginx
listen 443 ssl http2;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** | Save configuration |
| **Ctrl+Space** | Show autocompletion |
| **Tab** | Indent line/selection |
| **Shift+Tab** | Unindent line/selection |

## Editor Features

### Line Numbers
Each line is numbered on the left for easy reference.

### Active Line Highlighting
The current line is highlighted in light blue.

### Syntax Highlighting
- **Blue**: Directives (server, location, etc.)
- **Red**: Strings
- **Green**: Comments
- **Purple**: Numbers

### Bracket Matching
Matching brackets `{}` are highlighted when cursor is next to them.

## Tips & Best Practices

### 1. Always Test Before Saving
Use "Test Config" to catch syntax errors before saving.

### 2. Backup Important Configs
Keep backups of working configurations before making major changes.

### 3. Use Comments
Document your configuration with comments:
```nginx
# This is a comment
server {
    # Server configuration here
}
```

### 4. Test After Editing
After saving, always test and reload:
1. Edit configuration
2. Click "Test Config"
3. Click "Save Changes"
4. Click "Reload Nginx"

### 5. Check Logs on Errors
If nginx fails to reload, check logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Editor Not Loading
1. Refresh the page
2. Check browser console for errors
3. Verify CodeMirror files are loaded

### Cannot Save Configuration
1. Ensure you have sudo privileges
2. Check file permissions on /etc/nginx/
3. Verify Cockpit has superuser access

### Test Config Fails
1. Check the error message
2. Look for syntax errors (missing semicolons, brackets)
3. Verify file paths exist
4. Check for duplicate directives

### Nginx Reload Fails
1. First test the configuration
2. Check nginx error log
3. Verify nginx service is running: `sudo systemctl status nginx`

## Security Notes

- Editor requires sudo privileges
- All operations use Cockpit's secure API
- File operations are logged by the system
- Changes are written directly to /etc/nginx/

## Getting Help

- See [CONFIG_EDITOR_README.md](CONFIG_EDITOR_README.md) for detailed documentation
- See [FEATURES.md](FEATURES.md) for complete feature list
- Check the main [README.md](readme.md) for general project information

## Example: Creating a New Site

1. **Select a file**: Choose from Sites Available or create new
2. **Add server block**:
```nginx
server {
    listen 80;
    server_name newsite.com;
    root /var/www/newsite;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```
3. **Test**: Click "Test Config"
4. **Save**: Click "Save Changes"
5. **Enable**: Create symlink (if in sites-available):
```bash
sudo ln -s /etc/nginx/sites-available/newsite /etc/nginx/sites-enabled/
```
6. **Reload**: Click "Reload Nginx"

## Next Steps

- Explore advanced nginx features
- Set up SSL certificates
- Configure proxy settings
- Add custom error pages
- Optimize performance settings

Happy configuring! 🚀
