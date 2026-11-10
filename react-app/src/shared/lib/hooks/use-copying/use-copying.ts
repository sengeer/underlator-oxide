/**
 * @module UseCopying
 * Хук для управления копированием текста в буфер обмена.
 */

import { useState } from 'react';

/**
 * Предоставляет состояние копирования и функцию для выполнения операции копирования с автоматическим сбросом состояния.
 * Реализует Fallback для работы в небезопасных контекстах (http).
 *
 * @returns Объект с состоянием копирования и функцией для копирования текста.
 * @returns {boolean} isCopied - Флаг, указывающий на успешное копирование (true в течение 1500 миллисекунд).
 * @returns {function} handleCopy - Асинхронная функция для копирования текста в буфер обмена.
 */
function useCopying() {
  // Состояние успешного копирования, автоматически сбрасывается через 1.5 секунды
  const [isCopied, setIsCopied] = useState(false);

  /**
   * Внутренний синхронный вариант для небезопасных http-соединений.
   */
  function fallbackCopyTextToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Делает элемент невидимым и фиксирует его, чтобы избежать прыжков экрана
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  /**
   * Выполняет копирование текста в буфер обмена через Clipboard API или Fallback метод.
   * При успешном копировании устанавливает флаг isCopied в true на 1500 миллисекунд.
   *
   * @param output - Текст для копирования в буфер обмена.
   * @returns Promise<void> - Промис, который разрешается после завершения операции копирования.
   */
  async function handleCopy(output: string) {
    let success = false;

    // Проверяет доступность Clipboard API (доступно только в HTTPS или localhost)
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(output);
        success = true;
      } catch (err) {
        console.error('Clipboard API failed, trying fallback...', err);
        success = fallbackCopyTextToClipboard(output);
      }
    } else {
      // Если API недоступно, использует Fallback
      success = fallbackCopyTextToClipboard(output);
    }

    if (success) {
      setIsCopied(true);
      // Автоматический сброс состояния через 1.5 секунды для UX обратной связи
      setTimeout(() => setIsCopied(false), 1500);
    }
  }

  return {
    isCopied,
    handleCopy,
  };
}

export default useCopying;
