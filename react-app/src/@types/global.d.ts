/**
 * @module GlobalTypes
 * Глобальные типы React приложения.
 */

/**
 * Типы использования модели.
 */
type TypeUse = 'instruction' | 'translation' | 'contextualTranslation' | 'chat';

/**
 * Типы существующих провайдеров в приложении.
 */
type ProviderType = 'Ollama';

/**
 * Настройки конекретного провайдера.
 * Интерфейс для хранения специфичных настроек каждого провайдера.
 */
interface ProviderSettings {
  /** Идентификатор провайдера */
  id: string;
  /** URL провайдера */
  url: string;
  /** Название модели для использования */
  model?: string;
  /** Тип использования модели */
  typeUse?: TypeUse;
}

/**
 * Конфигурация RAG.
 */
interface QueryDocumentsConfig {
  /** Количество результатов */
  topK: number;
  /** Порог схожести */
  similarityThreshold: number;
  /** Название модели эмбеддингов для валидации цепочки */
  embeddingModel?: string;
}

/**
 * Интерфейс информации о текстовом узле.
 * Используется для работы с DOM узлами при переводе PDF документов.
 */
interface TextInfo {
  /** DOM текстовый узел */
  node: Text;
  /** Оригинальный текст узла */
  original: string;
  /** Родительский HTML элемент */
  element: HTMLElement;
}

/**
 * Алгебраический тип для результата парсинга.
 * Представляет результат операции парсинга с возможностью успеха или ошибки.
 */
type ParseResult<T> =
  /** Успешное выполнение парсинга */
  | { success: true; data: T }
  /** Ошибка при парсинге */
  | { success: false; error: string };

/**
 * Интерфейс фрагмента текста.
 * Используется для работы с частями текста при контекстном переводе.
 */
interface Chunk {
  /** Индекс фрагмента в массиве */
  idx: number;
  /** Содержимое фрагмента */
  text: string;
}

/**
 * Тип ответа модели.
 * Может быть фрагментом текста или строкой.
 */
type ModelResponse = Chunk | string;

/**
 * Дополнительные опции модели, перечисленные в Modelfile, такие как temperature.
 */
interface GenerateOptions {
  /** Температура генерации (0.0 - 1.0) */
  temperature?: number;
  /** Максимальное количество токенов в ответе */
  max_tokens?: number;
  /** Количество вариантов ответа */
  num_predict?: number;
  /** Включить режим "думания" модели */
  think?: boolean;
}

/**
 * Интерфейс параметров генерации.
 * Определяет настройки для работы с LLM моделями через хук useModel.
 */
interface UseModelParams {
  /** Режим получения ответа */
  responseMode: 'arrayStream' | 'stringStream' | string;
  /** Инструкция для модели */
  instruction?: string;
  /** ID чата для режима чата */
  chatId?: string;
  /** Флаг сохранения истории в чате */
  saveHistory?: boolean;
}

/**
 * Интерфейс для иконок.
 * Определяет свойства для отображения SVG иконок.
 */
interface Icon {
  /** Ширина иконки в пикселях */
  width?: number;
  /** Высота иконки в пикселях */
  height?: number;
  /** Цвет иконки */
  color?: string;
  /** Дополнительные CSS стили */
  style?: React.CSSProperties;
}
