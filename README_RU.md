<p align="center">
    <img src="./react-app/public/logo512.png" width="128" height="128">
</p>

<h1 align="center">Underlator</h1>

<div align="center">

Десктопное приложение для работы с локальными LLM: перевод текста и документов, интерактивный чат, интеллектуальный анализ документов.

[![license][license-image]][license-url]
[![release][release-image]][release-url]

[Английский](README.md) &nbsp;&nbsp;|&nbsp;&nbsp; Русский

![Демо](screenshots/demo.gif)

Вдохновлён [Monkeytype](https://monkeytype.com/). Работает на [Ollama](https://ollama.com/).

[license-image]: https://img.shields.io/badge/license-BSD--3--Clause%20%2B%20Branding-7D6EDE.svg

[license-url]: https://github.com/Sengeer/underlator/blob/main/LICENSE

[release-image]: https://img.shields.io/github/v/release/underlator/underlator.svg

[release-url]: https://github.com/Sengeer/underlator/releases/latest

</div>

## ✨ Особенности

- 🦙 **Работа с локальными LLM моделями** — просмотр, установка и удаление моделей на настроенном экземпляре Ollama;
- 🤔 **Поддержка думающих моделей** — работа с моделями, поддерживающими процесс размышления;
- 💬 **Интерактивный чат** — полнофункциональный чат с сохранением истории сообщений;
- 🔍 **Интеллектуальный анализ документов (RAG)** — задавайте вопросы по документам, получайте ответы на основе их содержимого;
- 📝 **Переводчик текста** — быстрый перевод обычного текста;
- 🕹️ **Работа с PDF-документами** — просмотр, перевод и анализ PDF файлов;
- 📄 **Режимы работы с PDF**:
  - Режим инструкции — задавайте вопросы по документу;
  - Режим переводчика — автоматический перевод содержимого PDF;
- 🤫 **Полная конфиденциальность** — все данные обрабатываются локально, без отправки в интернет;
- 📲 **Удобный интерфейс** — минималистичный дизайн;
- 🎨 **Настраиваемые темы** — выбор цветовой схемы оформления;
- 🚀 **Полностью автономное приложение** — работает без подключения к интернету.

## ⚙️ Первоначальная настройка

Underlator использует существующий экземпляр Ollama и не встраивает, и не устанавливает сам runtime Ollama. Запустите Ollama, выберите провайдер **Ollama** в разделе **API конфигурация**, укажите его base URL (на desktop по умолчанию `http://127.0.0.1:11434`) и выберите модель. Кнопка **Управление моделями** показывает, устанавливает и удаляет модели по этому настроенному URL.

## 📸 Скриншоты

<div align="center">

**Чат**

![чат_macos](screenshots/чат_macos.png)

**Перевод текста**

![перевод_текста_linux](screenshots/перевод_текста_linux.png)

**Взаимодействие в PDF**

![взаимодействие_в_pdf_windows](screenshots/взаимодействие_в_pdf_windows.png)

**Перевод документа**

![перевод_документа_macos](screenshots/перевод_документа_macos.png)

**Настройки**

![настройки_linux](screenshots/настройки_linux.png)

</div>

## 🚀 Официальные режимы запуска

### Desktop (Tauri 2)

Из корня репозитория:

```bash
cd crates/underlator-tauri
cargo tauri dev --features desktop
```

Команда Tauri для разработки также запускает React frontend. Зависимости ОС, release-сборка и канонические артефакты описаны в [docs/DESKTOP_TAURI.md](docs/DESKTOP_TAURI.md).

### Docker (HTTP server)

Из корня репозитория:

```bash
docker compose -f docker/docker-compose.yml up --build
```

React UI и HTTP API по умолчанию доступны на `http://localhost:8080`. Сервер использует Bearer-токен `UNDERLATOR_AUTH_TOKEN` (значение для разработки: `dev-change-me`); перед любым нелокальным развёртыванием задайте собственный секретный токен и пересоберите image. Настройки порта и окружения приведены в [docker/docker-compose.yml](docker/docker-compose.yml).

## 🔒 Безопасность и конфиденциальность

Underlator разработан для работы с чувствительными данными:

- ✅ **Только локальные LLM** — все обработка происходит на вашем компьютере
- ✅ **Локальное хранение** — все данные хранятся только на вашем устройстве
- ✅ **Без интернета** — приложение работает полностью автономно
- ✅ **Никаких внешних запросов** — ваши документы и сообщения никогда не покидают ваш компьютер

## 🗑️ Данные приложения и удаление

Чаты хранятся в `<StorageRoot>/chats/`.

Для **desktop Tauri** `StorageRoot` задаётся через `UNDERLATOR_DATA_DIR`; если переменная не задана, используется app data directory Tauri:

- **Linux**: `~/.local/share/app.underlator.desktop/`
- **macOS**: `~/Library/Application Support/app.underlator.desktop/`
- **Windows**: `%APPDATA%\app.underlator.desktop\`

Для **Docker** compose задаёт `StorageRoot` как `/data`, сохраняет его в volume `underlator-data`, а чаты размещает в `/data/chats/`. Чтобы удалить данные приложения, закройте его и удалите выбранную desktop-директорию или Docker volume, предварительно создав необходимый backup.

## Перенос чатов из legacy-версии

Автоматической миграции и скрипта миграции нет. Чтобы сохранить чаты из архивной Electron-установки:

1. Закройте и legacy, и новое приложение.
2. Создайте backup legacy-директории `userData` и нового хранилища; перед копированием убедитесь, что backup читается.
3. Из архивной директории `<legacy userData>/chats/` вручную скопируйте только файлы `chats/*.chat.json` в новую директорию `<StorageRoot>/chats/` (при необходимости создайте `chats`). Используйте указанный выше корень desktop Tauri или Docker `/data`; для Docker `/data` находится внутри volume `underlator-data`.
4. Не переносите RAG vectors и бинарные файлы Ollama. Не перезаписывайте существующие файлы без проверенного backup; автоматический merge и overwrite не предусмотрены.

## 📄 Лицензия

BSD-3-Clause + Branding (см. [LICENSE](LICENSE))

## 👤 Автор

Sengeer