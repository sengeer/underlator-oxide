# Desktop Tauri (atom 5.2)

English &nbsp;&nbsp;|&nbsp;&nbsp; [Russian](DESKTOP_TAURI_RU.md)

A document for people who cloned the repository: how to build and run the **desktop** Underlator host on Tauri 2, which native dependencies are required, which canonical artifacts are produced, and what has already been verified on real machines.

## Official modes: Desktop (Tauri) and Docker (server)

| Mode | Host | When to use |
| --- | --- | --- |
| **Desktop (Tauri)** | `crates/underlator-tauri` + `react-app` | Native build and run on Linux / macOS / Windows |
| **Docker (server)** | `crates/underlator-server` + compose | Server-side HTTP/SSE host; UI in a browser against the API |

Gate 5.2 is closed: the canonical AppImage passed a live MVP smoke on Fedora Workstation 44, `acceptance-smoke.json` contains `all_ok`, and macOS/Windows have the actual statuses documented below. This historical confirmation of desktop delivery readiness does not add a third supported mode.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | URL of the local Ollama instance for desktop | `http://127.0.0.1:11434` (not the docker DNS name `http://ollama:11434`) |
| `UNDERLATOR_DATA_DIR` | Override the chat data root | platform app data dir (see below) |
| `UNDERLATOR_PROVIDER_ID` | Provider id in the core factory | `ollama` |

The desktop data directory (when `UNDERLATOR_DATA_DIR` is not set) is the standard Tauri / OS app data directory, for example:

- Linux: `~/.local/share/app.underlator.desktop/` (or an equivalent path based on the `app.underlator.desktop` identifier)
- macOS: `~/Library/Application Support/app.underlator.desktop/`
- Windows: `%APPDATA%\app.underlator.desktop\`

The exact path depends on WebView/OS conventions; for smoke tests it is convenient to set an explicit `UNDERLATOR_DATA_DIR=/tmp/underlator-smoke`.

## Native prerequisites

### Linux (Fedora Workstation 44 — acceptance machine)

WebView / GTK (build and runtime):

```bash
sudo dnf install -y \
  webkit2gtk4.1-devel \
  gtk3-devel \
  libappindicator-gtk3 \
  librsvg2-devel \
  openssl-devel \
  curl wget file \
  gcc gcc-c++ make
```

AppImage / FUSE (bundler build + running the `.AppImage`):

```bash
sudo dnf install -y fuse fuse3
# linuxdeploy / appimagetool may pull additional packages itself;
# if the bundler complains about missing libs, install them as the error text suggests.
```

Also required: the Rust toolchain (`rustup`), Node.js + npm (for `react-app`), and the `cargo-tauri` CLI:

```bash
cargo install tauri-cli --version "^2" --locked
```

### macOS (Apple Silicon arm64 only, in scope 5.2)

- Xcode Command Line Tools: `xcode-select --install`
- Rust target: `rustup target add aarch64-apple-darwin` (usually already present on Apple Silicon)
- Node.js + npm
- `cargo install tauri-cli --version "^2" --locked`
- Intel `x86_64-apple-darwin` is **out of scope** for 5.2

### Windows 11 (portable zip)

- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) / VS Build Tools with the "Desktop development with C++" workload
- WebView2 Runtime (usually present on Win11; otherwise use the Evergreen Bootstrapper)
- Rust `x86_64-pc-windows-msvc`, Node.js + npm, `cargo-tauri` 2.x
- The `zip` utility (Git Bash / PowerShell `Compress-Archive`) for the canonical portable archive

## Common dependency errors

| Symptom | What to check |
| --- | --- |
| `webkit2gtk` / `javascriptcoregtk` not found | `webkit2gtk4.1-devel` packages (Fedora 40+) |
| `Package 'gtk+-3.0' not found` | `gtk3-devel` |
| AppImage: `fuse: failed to open /dev/fuse` | `fuse`/`fuse3`, user permissions, sometimes `./Underlator-….AppImage --appimage-extract-and-run` |
| bundling: `Strip call failed` / `.relr.dyn` | On Fedora: `NO_STRIP=1` (and `APPIMAGE_EXTRACT_AND_RUN=1` when needed) before `cargo tauri build` |
| Launch opens the AppImageLauncher dialog | `APPIMAGELAUNCHER_DISABLE=1` and/or `--appimage-extract-and-run` |
| `GStreamer element appsink not found` | Host `gstreamer1-plugins-base` (often a warning without UI crash) |
| Grey/blank window + `Failed to create GBM buffer` | WebKitGTK DMABUF; the Linux host sets `WEBKIT_DISABLE_DMABUF_RENDERER=1` before the webview (see Tauri linux-graphics). Rebuild the AppImage after the fix. Manual run: `WEBKIT_DISABLE_DMABUF_RENDERER=1 ./….AppImage` |
| "Chats" button → "application is not responding", Settings window | React `<ViewTransition>` + `startTransition` on WebKitGTK; the sidebar has no ViewTransition. Rebuild frontend/AppImage |
| Toast "Request error" while `curl :11434` works | Often `think: true` on a model without thinking support (Ollama: `does not support thinking`). The UI no longer sends think by default; core retries once without `think`. Check the model name in settings (`ollama list`). |
| Windows: missing WebView2 | install the WebView2 Evergreen Runtime |
| macOS: codesign / Gatekeeper on first launch | local unsigned debug/release build; notarization is out of scope for 5.2 |
| Empty frontend dist / 404 UI | run `npm run build` in `react-app` first or rely on `beforeBuildCommand` |

## Commands: Dev and Release

All commands below run from the **repository root** unless stated otherwise. Host feature: **`desktop`**.

### Dev (`cargo tauri dev`)

```bash
# deps: see prerequisites; Ollama should preferably be listening on :11434
cd crates/underlator-tauri
cargo tauri dev --features desktop
```

`beforeDevCommand` starts Vite (`npm run start` in `react-app`) on `http://localhost:5173`.

Manual equivalent without the hook:

```bash
# terminal 1
cd react-app && npm run start
# terminal 2
cd crates/underlator-tauri && cargo tauri dev --features desktop
```

### Release build (common skeleton)

`beforeBuildCommand` builds `react-app` → `react-app/dist`. You can also do it manually:

```bash
cd react-app && npm run build && cd ..
cd crates/underlator-tauri
cargo tauri build --features desktop
```

Then rename to the canonical names:

```bash
./scripts/rename-desktop-artifacts.sh
# dry-run without building:
./scripts/rename-desktop-artifacts.sh --dry-run
```

Canonical names (version from `crates/underlator-tauri/tauri.conf.json`, currently **`0.2.0-beta`**):

| Platform | Format | Canonical name |
| --- | --- | --- |
| Linux x86_64 | AppImage | `Underlator-0.2.0-beta-linux-x86_64.AppImage` |
| macOS arm64 | DMG | `Underlator-0.2.0-beta-macos-arm64.dmg` |
| Windows 11 | portable zip with `.exe` | `Underlator-0.2.0-beta-win-x64-portable.zip` |

**Not** part of DoD 5.2: `.deb`, MSI, NSIS — they are not a substitute for AppImage / DMG / portable zip.

The rename script writes to `dist-desktop/` by default.

### Linux: AppImage (Fedora 44)

```bash
  cd react-app && npm run build && cd ..
  cd crates/underlator-tauri
  # Fedora 40+/44: linuxdeploy ship-strip does not understand ELF `.relr.dyn` → NO_STRIP=1
    NO_STRIP=1 APPIMAGE_EXTRACT_AND_RUN=1 \
      cargo tauri build --features desktop --bundles appimage
  cd ../..
  # if CARGO_TARGET_DIR is non-standard, pass --bundle-root
  ./scripts/rename-desktop-artifacts.sh
  ls -la dist-desktop/Underlator-*-linux-x86_64.AppImage
  chmod +x dist-desktop/Underlator-*-linux-x86_64.AppImage
  # Run the .AppImage
  ./dist-desktop/Underlator-0.2.0-beta-linux-x86_64.AppImage --appimage-extract-and-run
# alternative: extract → AppRun (same AppImage payload)
#   ./Underlator-0.2.0-beta-linux-x86_64.AppImage --appimage-extract
#   APPIMAGELAUNCHER_DISABLE=1 UNDERLATOR_DATA_DIR=/tmp/u ./squashfs-root/AppRun
```

Optional live MVP smoke inside the host (the same thin handlers as invoke; against a local Ollama, not a mock):

```bash
UNDERLATOR_ACCEPTANCE_SMOKE=1 \
UNDERLATOR_SMOKE_MODEL=qwen2.5:0.5b \
UNDERLATOR_DATA_DIR=/tmp/underlator-smoke \
APPIMAGELAUNCHER_DISABLE=1 \
  ./dist-desktop/Underlator-0.2.0-beta-linux-x86_64.AppImage --appimage-extract-and-run
# → $UNDERLATOR_DATA_DIR/acceptance-smoke.json (all_ok)
```

Smoke against a local Ollama (mandatory gate 5.2 — **not** replaced by `tauri dev` / unit mocks):

1. Start Ollama: `ollama serve` (or systemd), URL `http://127.0.0.1:11434`
2. Launch the canonical AppImage
3. UI → Tauri transport (`TauriTransport`)
4. MVP: `model` (list / generate+progress / stop; install/remove depending on the environment), `catalog` (get/search/getModelInfo), `chat` (CRUD + addMessage + persist)

### macOS arm64: DMG (step by step)

On an **Apple Silicon** machine:

```bash
rustup target add aarch64-apple-darwin
cd react-app && npm run build && cd ..
cd crates/underlator-tauri
cargo tauri build --features desktop --target aarch64-apple-darwin --bundles dmg
cd ../..
./scripts/rename-desktop-artifacts.sh
open dist-desktop/Underlator-0.2.0-beta-macos-arm64.dmg
```

After mounting the DMG, move the application to Applications (or run it from the volume) and perform the same MVP smoke against a local Ollama.

### Windows 11: portable zip (step by step)

In `tauri.conf.json` the targets **do not** include NSIS/MSI as DoD. On Windows a release `.exe` is enough, then pack it into a portable zip:

```bash
cd react-app && npm run build && cd ..
cd crates/underlator-tauri
cargo tauri build --features desktop --no-bundle
cd ../..
./scripts/rename-desktop-artifacts.sh
# → dist-desktop/Underlator-0.2.0-beta-win-x64-portable.zip
```

PowerShell alternative for packing when bash/zip are unavailable:

```powershell
$exe = Get-ChildItem -Recurse -Filter underlator-tauri.exe target, crates\underlator-tauri\target |
  Where-Object { $_.FullName -match '\\release\\' -and $_.FullName -notmatch '\\nsis\\|\\msi\\' } |
  Select-Object -First 1
New-Item -ItemType Directory -Force dist-desktop | Out-Null
Copy-Item $exe.FullName dist-desktop\Underlator.exe
Compress-Archive -Path dist-desktop\Underlator.exe -DestinationPath dist-desktop\Underlator-0.2.0-beta-win-x64-portable.zip -Force
```

Unpack the zip → run `Underlator.exe` → MVP smoke against Ollama.

## verified / unverified matrix

| Artifact | Status | Note |
| --- | --- | --- |
| Fedora Workstation 44 · `Underlator-*-linux-x86_64.AppImage` | **verified** | Hard gate 5.2: canonical AppImage + UI + live MVP smoke vs Ollama (`acceptance-smoke.json`, `all_ok`); not `tauri dev` / not a mock |
| macOS arm64 · `Underlator-*-macos-arm64.dmg` | **unverified** | Docs + commands above; no agent machine |
| Windows 11 · `Underlator-*-win-x64-portable.zip` | **unverified** | Docs + commands above; no agent machine |

The macOS/Windows statuses **do not** weaken the Linux AppImage gate.

## Closed historical gate 5.2

Before atom 7.1 all gate evidence was confirmed:

1. The canonical AppImage on **Fedora Workstation 44** passed a live MVP smoke against a local Ollama; `acceptance-smoke.json` contains `all_ok`
2. This document contains commands for the macOS arm64 DMG and the Windows portable zip
3. The matrix above recorded the actual statuses (`verified` / `unverified`)

The closed gate remains historical delivery evidence; it is not replaced by `tauri dev` or unit/mock tests and does not change the current verification matrix.
