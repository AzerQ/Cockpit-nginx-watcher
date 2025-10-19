[English](#english) | [Русский](#russian)

<div id="english"></div>

# Cockpit Nginx Sites Dashboard

A Cockpit extension that provides a clean, interactive dashboard for managing and auditing websites configured in Nginx. It automatically detects all sites, checks their live status, monitors SSL certificates, and identifies connections to Docker containers.

The extension is designed to be self-contained: if the required helper script is missing, it will be automatically downloaded and installed.



## ✨ Features

*   **📊 Comprehensive Dashboard**: Displays all Nginx sites in a clean, sortable table.
*   **🚀 Live Status Check**: Shows real-time status (UP, DOWN, ERROR) with HTTP codes for each site.
*   **📄 Page Title Fetching**: Fetches and displays the `<title>` of each site's homepage for easy identification.
*   **🔒 SSL Monitoring**: Tracks SSL certificate expiration dates and highlights certificates that are expiring soon (less than 30 days).
*   **🐳 Docker Integration**: Automatically detects if a site is proxied to a running Docker container and displays the container's name.
*   **⚙️ Smart Installation**: The helper shell script is downloaded automatically if not found, making installation a breeze.
*   **💡 Detailed Information**: Provides insights into content type (Proxy vs. Static), target URL/path, and the Nginx config file for each site.
*   **🔄 One-Click Refresh**: Update all site statuses with a single click.

## 🧠 How It Works

The extension consists of two main components:

1.  **Cockpit Frontend (HTML/JS/CSS)**: The user interface you interact with. It's built using Cockpit's JavaScript API. When you open the page or click "Refresh", it initiates a process to fetch data.
2.  **Backend Helper Script (`nginx_info.sh`)**: A powerful Bash script that does the heavy lifting. It scans Nginx configuration files, parses site details, performs live `curl` checks, and outputs everything into a structured JSON format.

The frontend is designed to be smart:
*   It first checks if `/usr/local/bin/nginx_info.sh` exists.
*   If the script is missing, it downloads it from the official Gist URL and makes it executable.
*   Finally, it executes the script with `sudo` permissions (granted via the `manifest.json`) and renders the returned JSON data in the dashboard.

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

This project is structured to be easily understood and extended.

### File Structure

```
nginx/
├── cockpit.d.js      # JSDoc type definitions for the Cockpit API (for IntelliSense)
├── manifest.json       # Extension manifest (permissions, name, icon)
├── nginx.css           # All custom styles for the dashboard
├── nginx.html          # The HTML structure of the page
└── nginx.js            # The "brains" of the extension: handles logic, script execution, and rendering
```
*   **`nginx.js`**: This file is fully documented with **JSDoc** comments. Type definitions for the Cockpit API and the JSON data structure are included, enabling static type checking if you use `@ts-check` in VS Code.
*   **`nginx_info.sh` (Helper Script)**: This script is not part of the repository but is downloaded at runtime. It resides in `/usr/local/bin/nginx_info.sh` after the first run.

### Troubleshooting

*   **Extension does not appear in Cockpit**:
    *   Ensure the `nginx` directory was copied correctly to `/usr/share/cockpit/`.
    *   Make sure you have restarted the Cockpit service with `sudo systemctl restart cockpit`.
    *   Check Cockpit logs for errors.

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



## ✨ Возможности

*   **📊 Комплексная панель**: Отображает все сайты Nginx в удобной таблице с возможностью сортировки.
*   **🚀 Проверка статуса в реальном времени**: Показывает актуальный статус (UP, DOWN, ERROR) с HTTP-кодом для каждого сайта.
*   **📄 Получение заголовков**: Загружает и отображает `<title>` с главной страницы каждого сайта для легкой идентификации.
*   **🔒 Мониторинг SSL**: Отслеживает даты окончания срока действия SSL-сертификатов и подсвечивает те, что истекают в ближайшее время (менее 30 дней).
*   **🐳 Интеграция с Docker**: Автоматически определяет, проксируется ли сайт на запущенный Docker-контейнер, и отображает его имя.
*   **⚙️ Умная установка**: Вспомогательный shell-скрипт загружается автоматически, если не найден, что делает установку максимально простой.
*   **💡 Подробная информация**: Предоставляет данные о типе контента (Proxy или Static), целевом URL/пути и конфигурационном файле Nginx для каждого сайта.
*   **🔄 Обновление в один клик**: Позволяет обновить статусы всех сайтов одним нажатием кнопки.

## 🧠 Как это работает

Расширение состоит из двух основных компонентов:

1.  **Фронтенд Cockpit (HTML/JS/CSS)**: Пользовательский интерфейс, с которым вы взаимодействуете. Он построен с использованием JavaScript API от Cockpit. Когда вы открываете страницу или нажимаете "Обновить", он инициирует процесс получения данных.
2.  **Вспомогательный скрипт (`nginx_info.sh`)**: Мощный Bash-скрипт, который выполняет всю основную работу. Он сканирует конфигурационные файлы Nginx, анализирует детали сайтов, выполняет `curl`-запросы в реальном времени и выводит все данные в структурированном формате JSON.

Фронтенд-часть работает по "умному" алгоритму:
*   Сначала она проверяет, существует ли файл `/usr/local/bin/nginx_info.sh`.
*   Если скрипт отсутствует, она загружает его с официального URL Gist и делает исполняемым.
*   Наконец, она выполняет скрипт с правами `sudo` (разрешение предоставляется через `manifest.json`) и отображает полученные JSON-данные в панели управления.

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

Структура проекта организована так, чтобы ее было легко понимать и расширять.

### Структура файлов

```
nginx/
├── cockpit.d.js      # JSDoc-определения типов для Cockpit API (для автодополнения в IDE)
├── manifest.json       # Манифест расширения (права, название, иконка)
├── nginx.css           # Все кастомные стили для панели
├── nginx.html          # HTML-структура страницы
└── nginx.js            # "Мозг" расширения: логика, выполнение скрипта и рендеринг
```
*   **`nginx.js`**: Этот файл полностью документирован с помощью комментариев **JSDoc**. Включены определения типов для Cockpit API и структуры данных JSON, что позволяет использовать статическую проверку типов с помощью `@ts-check` в VS Code.
*   **`nginx_info.sh` (Вспомогательный скрипт)**: Этот скрипт не является частью репозитория, а загружается во время выполнения. После первого запуска он будет находиться по пути `/usr/local/bin/nginx_info.sh`.

### Устранение неполадок

*   **Расширение не появляется в Cockpit**:
    *   Убедитесь, что директория `nginx` была корректно скопирована в `/usr/share/cockpit/`.
    *   Убедитесь, что вы перезапустили службу Cockpit командой `sudo systemctl restart cockpit`.
    *   Проверьте логи Cockpit на наличие ошибок.

*   **Панель управления показывает сообщение об ошибке**:
    *   Наиболее частая проблема связана с правами доступа. Расширению необходимо выполнять команды от имени `root`.
    *   Если у вас включен **SELinux**, он может блокировать выполнение скрипта `/usr/local/bin/nginx_info.sh`. Проверьте лог аудита (`/var/log/audit/audit.log`) на наличие `AVC` отказов и при необходимости создайте соответствующий модуль политики.
    *   Попробуйте запустить вспомогательный скрипт вручную, чтобы увидеть его вывод: `sudo /usr/local/bin/nginx_info.sh`.

## 📜 Лицензия

Этот проект распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).
