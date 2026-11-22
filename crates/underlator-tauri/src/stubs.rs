//! Desktop-only заготовки: mailto / native dialogs.
//!
//! **Не блокер MVP** `model` / `catalog` / `chat`. Splash и embedded Ollama —
//! `dropped by ADR` (`docs/adr/0001-embedded-ollama-and-splash-dropped.md`);
//! runtime installer / splash lifecycle здесь **не** реализованы.

/// Открыть `mailto:` (заготовка; не входит в MVP DoD).
///
/// Позже: `tauri-plugin-opener` / системный handler.
pub fn mailto_stub(address: &str) -> Result<(), String> {
    let _ = address;
    Err("mailto: заготовка desktop-only; не блокер MVP".to_owned())
}

/// Нативный диалог выбора файла (заготовка; не входит в MVP DoD).
///
/// Позже: `tauri-plugin-dialog`.
pub fn open_file_dialog_stub() -> Result<Option<String>, String> {
    Err("native dialog: заготовка desktop-only; не блокер MVP".to_owned())
}

/// Splash / embedded Ollama — **dropped by ADR**, без runtime.
///
/// См. `docs/adr/0001-embedded-ollama-and-splash-dropped.md`.
/// Restoration not planned; requires new change + ADR update.
pub fn splash_and_embedded_ollama_later() {
    // no-op: dropped by ADR, no runtime
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stubs_do_not_gate_mvp() {
        assert!(mailto_stub("a@b.c").is_err());
        assert!(open_file_dialog_stub().is_err());
        splash_and_embedded_ollama_later();
    }
}
