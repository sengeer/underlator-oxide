# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-beta] - 2026-11-22

### Added

- 🦀 Rust core with hexagonal layers shared by both official modes: desktop Tauri 2 and Docker HTTP server
- 🔌 Dual-mode frontend with automatic transport selection (Tauri IPC or HTTP)
- 🚀 CI workflow on push and pull request across Linux, macOS and Windows
- 📦 Release workflow with a version guard and draft releases for AppImage, macOS arm64 DMG and Windows portable zip

### Changed

- Version carriers synchronized on `0.2.0-beta` with `crates/underlator-tauri/tauri.conf.json` as the single source
- README and desktop documentation reflect the actual MVP: EN canon plus RU mirror, links to `sengeer/underlator-oxide`
- About dialog shows the product description, author, contact, license and the archived Electron version

### Removed

- RAG, splash and embedded Ollama are out of the MVP: RAG is deferred, splash and embedded Ollama are dropped by ADR

## [0.1.0-beta] - 2026-02-03

### Added

- 🦙 Support for local LLM models via Ollama with automatic installation and management
- 🤔 Support for thinking models that support the thinking process
- 💬 Interactive chat with full message history
- 🔍 Intelligent document analysis (RAG) - ask questions about documents and get answers based on their content
- 📝 Text translator for quick translation of plain text
- 🕹️ PDF document handling - view, translate, and analyze PDF files
- 📄 PDF working modes:
  - Instruction mode - ask questions about the document
  - Document translation mode - automatic translation of PDF content
- 🎨 Customizable themes - choose your color scheme
- 🤫 Full confidentiality - all data is processed locally, without sending to the internet
- 🚀 Fully autonomous application - works without internet connection
