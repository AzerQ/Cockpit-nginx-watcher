[English](#english) | [Русский](#russian)

<div id="english"></div>

# Cockpit Nginx Sites Dashboard


![NginxSites](img/NginxSites.png)

A Cockpit extension that provides a clean, interactive dashboard for managing and auditing websites configured in Nginx. It automatically detects all sites, checks their live status, monitors SSL certificates, and identifies connections to Docker containers.

The extension is designed to be self-contained: if the required helper script is missing, it will be automatically downloaded and installed.

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Code Editor**: CodeMirror 5.65.16 (with nginx mode)
- **Type Safety**: JSDoc with TypeScript type checking
- **Backend**: Bash scripting (helper script)
- **API**: Cockpit JavaScript API



## ✨ Features

### Dashboard
*   **📊 Comprehensive Dashboard**: Displays all Nginx sites in a clean, sortable table.
*   **🚀 Live Status Check**: Shows real-time status (UP, DOWN, ERROR) with HTTP codes for each site.
*   **📄 Page Title Fetching**: Fetches and displays the `<title>` of each site's homepage for easy identification.
*   **🔒 SSL Monitoring**: Tracks SSL certificate expiration dates and highlights certificates that are expiring soon (less than 30 days).
*   **🐳 Docker Integration**: Automatically detects if a site is proxied to a running Docker container and displays the container's name.
*   **⚙️ Smart Installation**: The helper shell script is downloaded automatically if not found, making installation a breeze.
*   **💡 Detailed Information**: Provides insights into content type (Proxy vs. Static), target URL/path, and the Nginx config file for each site.
*   **🔄 One-Click Refresh**: Update all site statuses with a single click.

### Configuration Editor
*   **✏️ Syntax Highlighting**: Full nginx configuration syntax highlighting using CodeMirror.
*   **🎯 Autocompletion**: Context-aware autocompletion for nginx directives (trigger with Ctrl+Space).
*   **📁 File Browser**: Browse and edit all nginx configuration files organized by category.
*   **✅ Config Testing**: Test nginx configuration syntax before applying changes.
*   **🔄 Safe Reload**: Reload nginx service with automatic configuration validation.
*   **⌨️ Keyboard Shortcuts**: Ctrl+S to save, Ctrl+Space for autocomplete.

## 🧠 How It Works

The extension consists of several modular components:

1.  **Cockpit Frontend (HTML/JS/CSS)**: The user interface you interact with, built using Bootstrap 5 and Cockpit's JavaScript API.
    - `nginx.html`: Page structure with responsive Bootstrap components
    - `ui.js`: Handles all UI rendering and DOM manipulations
    - `nginx.css`: Custom styling for the dashboard
    
2.  **Backend Communication Layer (`api.js`)**: Manages interaction with the helper script.
    - Checks for script existence
    - Downloads and installs the script if missing
    - Executes the script with sudo privileges
    - Parses and validates JSON responses
    
3.  **Backend Helper Script (`nginx_info.sh`)**: A powerful Bash script that does the heavy lifting. It scans Nginx configuration files, parses site details, performs live `curl` checks, and outputs everything into a structured JSON format.

The workflow is straightforward:
*   When you open the page or click "Refresh", `ui.js` calls the API from `api.js`
*   `api.js` checks if `/usr/local/bin/nginx_info.sh` exists
*   If the script is missing, it downloads it from the official Gist URL and makes it executable
*   The script is executed with `sudo` permissions (granted via the `manifest.json`)
*   The returned JSON data is rendered by `ui.js` in the dashboard

## ✅ Prerequisites

Before you begin, ensure your server has the following installed:
*   `cockpit`
*   `nginx`
*   `curl`
*   `openssl`
*   `python3` (used by the helper script for robust JSON escaping)
*   `git` (to clone this repository)
*   `docker` (optional, required for container detection)

## 🛠️ Installation

Installation is a simple one-liner. Run the following command as a user with `sudo` privileges:

```bash
cd /usr/share/cockpit
git clone https://github.com/AzerQ/Cockpit-nginx-watcher
```

## 🚀 Usage

1.  Log in to your Cockpit web interface (usually at `https://your_server_ip:9090`).
2.  You will find a new **"Nginx Sites"** tab in the main navigation menu on the left.
3.  Click it to view the dashboard. The data will be loaded automatically.

## 👨‍💻 For Developers

This project is structured to be easily understood and extended. The code is organized into modular components with clear separation of concerns.

### Architecture

The extension follows a clean separation between data fetching (`api.js`) and UI rendering (`ui.js`):

- **`api.js`** - Backend communication layer:
  - Checks for the existence of the helper script
  - Downloads and installs the script if missing
  - Executes the script with sudo privileges
  - Parses and validates JSON responses
  - Provides a clean Promise-based API

- **`ui.js`** - Presentation layer:
  - Manages all DOM manipulations
  - Renders statistics cards
  - Builds and updates the sites table
  - Handles loading states and error displays
  - Wires up event handlers

Both files use **JSDoc** type annotations with `@ts-check` for enhanced type safety and IDE support.

### Development Workflow

To modify or extend the extension:

1. **Edit API logic**: Modify `api.js` to change how data is fetched or add new data sources
2. **Edit UI rendering**: Modify `ui.js` to change how data is displayed or add new UI components
3. **Update styles**: Edit `nginx.css` for visual customization
4. **Change layout**: Edit `nginx.html` to modify the page structure
5. **Test changes**: Refresh the page in Cockpit (no need to restart the service during development)

### Type Definitions

All JavaScript files include JSDoc type annotations. The `cockpit.d.js` file provides Cockpit API types, while `api.js` defines the data structure types returned by the backend script. This enables:

- **IntelliSense** in VS Code and other modern editors
- **Type checking** with `@ts-check` directive
- **Better code documentation** and maintainability

### File Structure

```
Cockpit-nginx-watcher/
├── api.js              # Data fetching logic: script execution and JSON parsing
├── cockpit.d.js        # JSDoc type definitions for the Cockpit API (for IntelliSense)
├── manifest.json       # Extension manifest (permissions, name, icon)
├── nginx.css           # All custom styles for the dashboard
├── nginx.html          # The HTML structure of the page
├── ui.js               # UI rendering logic: handles DOM manipulations
├── readme.md           # This documentation file
├── img/
│   └── NginxSites.png  # Dashboard screenshot
└── lib/
    ├── bootstrap.bundle.min.js  # Bootstrap 5 JavaScript bundle
    └── bootstrap.min.css        # Bootstrap 5 CSS styles
```

*   **`api.js`**: Contains all the backend communication logic. It checks for the helper script, downloads it if needed, and executes it to fetch Nginx data.
*   **`ui.js`**: Handles all UI rendering and DOM manipulations. It displays statistics, renders the sites table, and manages loading states.
*   **`nginx.html`**: The main HTML page structure with Bootstrap 5 components.
*   **`nginx.css`**: Custom CSS styles for the dashboard.
*   **`cockpit.d.js`**: JSDoc type definitions for the Cockpit API, enabling IntelliSense and type checking in modern IDEs.
*   **`manifest.json`**: Defines the extension metadata, permissions, and menu entry.
*   **`lib/`**: Contains Bootstrap 5 framework files (CSS and JavaScript) for responsive UI components.
*   **`nginx_info.sh` (Helper Script)**: This script is not part of the repository but is downloaded at runtime. It resides in `/usr/local/bin/nginx_info.sh` after the first run.

### Troubleshooting

*   **Extension does not appear in Cockpit**:
    *   Ensure the repository was cloned correctly to `/usr/share/cockpit/nginx/`.
    *   Make sure you have restarted the Cockpit service with `sudo systemctl restart cockpit`.
    *   Check Cockpit logs for errors: `sudo journalctl -u cockpit`.

*   **Dashboard shows an error message**:
    *   The most common issue is related to permissions. The extension needs to run commands as `root`.
    *   If you have **SELinux** enabled, it might be blocking Cockpit from executing the `/usr/local/bin/nginx_info.sh` script. Check the audit log (`/var/log/audit/audit.log`) for `AVC` denials and create a corresponding policy module if needed.
    *   Try running the helper script manually to see its output: `sudo /usr/local/bin/nginx_info.sh`.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div id="russian"></div>

# Панель управления сайтами Nginx для Cockpit

Расширение для Cockpit, которое предоставляет удобную интерактивную панель для управления и аудита веб-сайтов, настроенных в Nginx. Оно автоматически обнаруживает все сайты, проверяет их статус в реальном времени, отслеживает SSL-сертификаты и определяет связи с Docker-контейнерами.

Расширение спроектировано как самодостаточное: если необходимый вспомогательный скрипт отсутствует, он будет автоматически загружен и установлен.

## 🛠️ Технологии

- **Фронтенд**: HTML5, CSS3, JavaScript (ES6+)
- **UI-фреймворк**: Bootstrap 5
- **Редактор кода**: CodeMirror 5.65.16 (с режимом nginx)
- **Типобезопасность**: JSDoc с проверкой типов TypeScript
- **Бэкенд**: Bash-скрипты (вспомогательный скрипт)
- **API**: Cockpit JavaScript API



## ✨ Возможности

### Панель управления
*   **📊 Комплексная панель**: Отображает все сайты Nginx в удобной таблице с возможностью сортировки.
*   **🚀 Проверка статуса в реальном времени**: Показывает актуальный статус (UP, DOWN, ERROR) с HTTP-кодом для каждого сайта.
*   **📄 Получение заголовков**: Загружает и отображает `<title>` с главной страницы каждого сайта для легкой идентификации.
*   **🔒 Мониторинг SSL**: Отслеживает даты окончания срока действия SSL-сертификатов и подсвечивает те, что истекают в ближайшее время (менее 30 дней).
*   **🐳 Интеграция с Docker**: Автоматически определяет, проксируется ли сайт на запущенный Docker-контейнер, и отображает его имя.
*   **⚙️ Умная установка**: Вспомогательный shell-скрипт загружается автоматически, если не найден, что делает установку максимально простой.
*   **💡 Подробная информация**: Предоставляет данные о типе контента (Proxy или Static), целевом URL/пути и конфигурационном файле Nginx для каждого сайта.
*   **🔄 Обновление в один клик**: Позволяет обновить статусы всех сайтов одним нажатием кнопки.

### Редактор конфигураций
*   **✏️ Подсветка синтаксиса**: Полная подсветка синтаксиса конфигураций nginx с использованием CodeMirror.
*   **🎯 Автодополнение**: Контекстное автодополнение директив nginx (вызов через Ctrl+Space).
*   **📁 Браузер файлов**: Просмотр и редактирование всех конфигурационных файлов nginx, организованных по категориям.
*   **✅ Тестирование конфигурации**: Проверка синтаксиса конфигурации nginx перед применением изменений.
*   **🔄 Безопасная перезагрузка**: Перезагрузка службы nginx с автоматической валидацией конфигурации.
*   **⌨️ Горячие клавиши**: Ctrl+S для сохранения, Ctrl+Space для автодополнения.

## 🧠 Как это работает

Расширение состоит из нескольких модульных компонентов:

1.  **Фронтенд Cockpit (HTML/JS/CSS)**: Пользовательский интерфейс, с которым вы взаимодействуете, построенный с использованием Bootstrap 5 и JavaScript API от Cockpit.
    - `nginx.html`: Структура страницы с адаптивными компонентами Bootstrap
    - `ui.js`: Обрабатывает все операции рендеринга UI и манипуляции с DOM
    - `nginx.css`: Пользовательские стили для панели управления
    
2.  **Слой взаимодействия с бэкендом (`api.js`)**: Управляет взаимодействием со вспомогательным скриптом.
    - Проверяет наличие скрипта
    - Загружает и устанавливает скрипт при отсутствии
    - Выполняет скрипт с правами sudo
    - Парсит и валидирует JSON-ответы
    
3.  **Вспомогательный скрипт (`nginx_info.sh`)**: Мощный Bash-скрипт, который выполняет всю основную работу. Он сканирует конфигурационные файлы Nginx, анализирует детали сайтов, выполняет `curl`-запросы в реальном времени и выводит все данные в структурированном формате JSON.

Рабочий процесс простой и понятный:
*   Когда вы открываете страницу или нажимаете "Refresh", `ui.js` вызывает API из `api.js`
*   `api.js` проверяет, существует ли файл `/usr/local/bin/nginx_info.sh`
*   Если скрипт отсутствует, он загружает его с официального URL Gist и делает исполняемым
*   Скрипт выполняется с правами `sudo` (разрешение предоставляется через `manifest.json`)
*   Полученные JSON-данные отображаются в панели управления с помощью `ui.js`

## ✅ Требования

Перед началом убедитесь, что на вашем сервере установлено следующее:
*   `cockpit`
*   `nginx`
*   `curl`
*   `openssl`
*   `python3` (используется скриптом для надежного экранирования JSON)
*   `git` (для клонирования этого репозитория)
*   `docker` (необязательно, требуется для определения контейнеров)

## 🛠️ Установка

Установка выполняется одной простой командой. Запустите ее от имени пользователя с правами `sudo`:

```bash
cd /usr/share/cockpit
git clone https://github.com/AzerQ/Cockpit-nginx-watcher
```

## 🚀 Использование

1.  Войдите в веб-интерфейс Cockpit (обычно по адресу `https://ip_вашего_сервера:9090`).
2.  В главном меню навигации слева вы найдете новый пункт **"Nginx Sites"**.
3.  Нажмите на него, чтобы открыть панель управления. Данные будут загружены автоматически.

## 👨‍💻 Для разработчиков

Структура проекта организована так, чтобы ее было легко понимать и расширять. Код разделён на модульные компоненты с чётким разделением ответственности.

### Архитектура

Расширение следует принципу чистого разделения между получением данных (`api.js`) и отображением UI (`ui.js`):

- **`api.js`** - Слой взаимодействия с бэкендом:
  - Проверяет наличие вспомогательного скрипта
  - Загружает и устанавливает скрипт при отсутствии
  - Выполняет скрипт с правами sudo
  - Парсит и валидирует JSON-ответы
  - Предоставляет чистый API на основе Promise

- **`ui.js`** - Слой представления:
  - Управляет всеми манипуляциями с DOM
  - Отображает карточки статистики
  - Строит и обновляет таблицу сайтов
  - Обрабатывает состояния загрузки и отображение ошибок
  - Подключает обработчики событий

Оба файла используют аннотации типов **JSDoc** с директивой `@ts-check` для повышенной типобезопасности и поддержки в IDE.

### Процесс разработки

Чтобы изменить или расширить функциональность расширения:

1. **Редактирование логики API**: Измените `api.js` для изменения способа получения данных или добавления новых источников данных
2. **Редактирование отображения UI**: Измените `ui.js` для изменения способа отображения данных или добавления новых UI-компонентов
3. **Обновление стилей**: Отредактируйте `nginx.css` для визуальной настройки
4. **Изменение макета**: Отредактируйте `nginx.html` для изменения структуры страницы
5. **Тестирование изменений**: Обновите страницу в Cockpit (не требуется перезапуск службы во время разработки)

### Определения типов

Все JavaScript-файлы включают аннотации типов JSDoc. Файл `cockpit.d.js` предоставляет типы для Cockpit API, в то время как `api.js` определяет типы структуры данных, возвращаемых бэкенд-скриптом. Это обеспечивает:

- **IntelliSense** в VS Code и других современных редакторах
- **Проверку типов** с помощью директивы `@ts-check`
- **Улучшенную документацию кода** и удобство сопровождения

### Структура файлов

```
Cockpit-nginx-watcher/
├── api.js              # Логика получения данных: выполнение скрипта и парсинг JSON
├── cockpit.d.js        # JSDoc-определения типов для Cockpit API (для автодополнения в IDE)
├── manifest.json       # Манифест расширения (права, название, иконка)
├── nginx.css           # Все кастомные стили для панели
├── nginx.html          # HTML-структура страницы
├── ui.js               # Логика отображения UI: манипуляции с DOM
├── readme.md           # Этот файл документации
├── img/
│   └── NginxSites.png  # Скриншот панели управления
└── lib/
    ├── bootstrap.bundle.min.js  # Bootstrap 5 JavaScript bundle
    └── bootstrap.min.css        # Bootstrap 5 CSS стили
```

*   **`api.js`**: Содержит всю логику взаимодействия с бэкендом. Проверяет наличие вспомогательного скрипта, загружает его при необходимости и выполняет для получения данных Nginx.
*   **`ui.js`**: Обрабатывает все операции рендеринга UI и манипуляции с DOM. Отображает статистику, таблицу сайтов и управляет состояниями загрузки.
*   **`nginx.html`**: Основная HTML-структура страницы с компонентами Bootstrap 5.
*   **`nginx.css`**: Пользовательские CSS-стили для панели управления.
*   **`cockpit.d.js`**: JSDoc-определения типов для Cockpit API, обеспечивающие автодополнение и проверку типов в современных IDE.
*   **`manifest.json`**: Определяет метаданные расширения, права доступа и пункт меню.
*   **`lib/`**: Содержит файлы фреймворка Bootstrap 5 (CSS и JavaScript) для адаптивных UI-компонентов.
*   **`nginx_info.sh` (Вспомогательный скрипт)**: Этот скрипт не является частью репозитория, а загружается во время выполнения. После первого запуска он будет находиться по пути `/usr/local/bin/nginx_info.sh`.

### Устранение неполадок

*   **Расширение не появляется в Cockpit**:
    *   Убедитесь, что репозиторий был корректно клонирован в `/usr/share/cockpit/nginx/`.
    *   Убедитесь, что вы перезапустили службу Cockpit командой `sudo systemctl restart cockpit`.
    *   Проверьте логи Cockpit на наличие ошибок: `sudo journalctl -u cockpit`.

*   **Панель управления показывает сообщение об ошибке**:
    *   Наиболее частая проблема связана с правами доступа. Расширению необходимо выполнять команды от имени `root`.
    *   Если у вас включен **SELinux**, он может блокировать выполнение скрипта `/usr/local/bin/nginx_info.sh`. Проверьте лог аудита (`/var/log/audit/audit.log`) на наличие `AVC` отказов и при необходимости создайте соответствующий модуль политики.
    *   Попробуйте запустить вспомогательный скрипт вручную, чтобы увидеть его вывод: `sudo /usr/local/bin/nginx_info.sh`.

## 📜 Лицензия

Этот проект распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).
