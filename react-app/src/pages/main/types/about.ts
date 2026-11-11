/**
 * @module AboutTypes
 * Типы для компонента About.
 */

/**
 * Пропсы компонента About.
 */
export interface AboutProps {
  /** Состояние открытия модального окна */
  isOpened: boolean;
  /** Функция для изменения состояния открытия */
  setOpened: (value: boolean) => void;
}
