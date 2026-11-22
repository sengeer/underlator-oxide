<p align="center">
    <img src="./react-app/public/logo512.png" width="128" height="128">
</p>

<h1 align="center">Underlator</h1>

<div align="center">

Desktop application for working with local LLMs: text and document translation, interactive chat.

[![license][license-image]][license-url]
[![release][release-image]][release-url]

English &nbsp;&nbsp;|&nbsp;&nbsp; [Russian](README_RU.md)

The earlier Electron-based version is archived at [sengeer/underlator](https://github.com/sengeer/underlator) and kept for history only.

![demo](screenshots/demo.gif)

Inspired by [Monkeytype](https://monkeytype.com/). Powered by [Ollama](https://ollama.com/).

[license-image]: https://img.shields.io/badge/license-BSD--3--Clause%20%2B%20Branding-7D6EDE.svg

[license-url]: https://github.com/sengeer/underlator-oxide/blob/main/LICENSE

[release-image]: https://img.shields.io/github/v/release/sengeer/underlator-oxide.svg

[release-url]: https://github.com/sengeer/underlator-oxide/releases/latest

</div>

## ✨ Features

- 🦙 **Local LLM models** — list, install, and remove models on your configured Ollama instance;
- 🤔 **Support thinking models** — work with models that support the thinking process;
- 💬 **Interactive chat** — full-featured chat with message history;
- 📝 **Text translator** — quick translation of plain text;
- 🕹️ **PDF document handling** — view, translate, and analyze PDF files;
- 📄 **PDF working modes**:
  - Instruction mode — ask questions about the document;
  - Document translation mode — automatic translation of PDF content;
- 🤫 **Full confidentiality** — all data is processed locally, without sending to the internet;
- 📲 **Convenient interface** — minimalist design;
- 🎨 **Customizable themes** — choose your color scheme;
- 🚀 **Fully autonomous application** — works without internet connection.

## ⚙️ Initial Setup

Underlator uses an existing Ollama instance; it does not embed or install the Ollama runtime. Start Ollama, then select the **Ollama** provider in **API configuration**, enter its base URL (`http://127.0.0.1:11434` by default on desktop), and choose a model. The **manage models** button lists, installs, and removes models at that configured URL.

## 📸 Screenshots

<div align="center">

**Chat**

![chat_macos](screenshots/chat_macos.png)

**Text translation**

![text_translation_linux](screenshots/text_translation_linux.png)

**Interaction in PDF**

![interaction_in_pdf_windows](screenshots/interaction_in_pdf_windows.png)

**Document translation**

![document_translation_macos](screenshots/document_translation_macos.png)

**Settings**

![settings_linux](screenshots/settings_linux.png)

</div>

## 🚀 Official Run Modes

### Desktop (Tauri 2)

From the repository root:

```bash
cd crates/underlator-tauri
cargo tauri dev --features desktop
```

The Tauri development command also starts the React frontend. OS prerequisites, release builds, and canonical artifacts are documented in [docs/DESKTOP_TAURI.md](docs/DESKTOP_TAURI.md).

### Docker (HTTP server)

From the repository root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

The React UI and HTTP API are available at `http://localhost:8080` by default. The server uses the `UNDERLATOR_AUTH_TOKEN` Bearer token (development default: `dev-change-me`); set a private token before any non-local deployment and rebuild the image. See [docker/docker-compose.yml](docker/docker-compose.yml) for port and environment configuration.

## 🔒 Security and Confidentiality

Underlator is designed for working with sensitive data:

- ✅ **Local LLMs only** — all processing happens on your computer
- ✅ **Local storage** — all data is stored only on your device
- ✅ **No internet required** — the application works completely autonomously
- ✅ **No external requests** — your documents and messages never leave your computer

## 🗑️ Application Data and Uninstall

Chats are stored under `<StorageRoot>/chats/`.

For **desktop Tauri**, `StorageRoot` is `UNDERLATOR_DATA_DIR` when set; otherwise it is the Tauri app data directory:

- **Linux**: `~/.local/share/app.underlator.desktop/`
- **macOS**: `~/Library/Application Support/app.underlator.desktop/`
- **Windows**: `%APPDATA%\app.underlator.desktop\`

For **Docker**, compose sets `StorageRoot` to `/data`, persists it in the `underlator-data` volume, and stores chats in `/data/chats/`. To remove application data, close the application and delete the selected desktop storage directory or Docker volume only after making any needed backup.

## Legacy Chat Migration

There is no automatic migration or migration script. To preserve chats from an archived Electron installation:

1. Close both the legacy and new applications.
2. Back up the legacy `userData` directory and the new storage location; verify that the backups can be read before copying anything.
3. From the archived `<legacy userData>/chats/` directory, manually copy only `chats/*.chat.json` files into the new `<StorageRoot>/chats/` directory (create `chats` if needed). Use the desktop Tauri or Docker `/data` root described above. For Docker, `/data` is inside the `underlator-data` volume.
4. Do not copy vector indexes, embeddings, or Ollama binaries. Do not overwrite existing files without a verified backup; automatic merging and overwrite are not provided.

## 📄 License

BSD-3-Clause + Branding (see [LICENSE](LICENSE))

## 👤 Author

sengeer
