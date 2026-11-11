/**
 * @module About
 * Компонент модального окна о проекте.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useDispatch } from 'react-redux';
import packageJson from '../../../../package.json';
import CopyrightIcon from '../../../shared/assets/icons/copyright-icon';
import logo from '../../../shared/assets/images/logo.svg';
import callANotificationWithALog from '../../../shared/lib/utils/call-a-notification-with-a-log';
import Popup from '../../../shared/ui/popup';
import TextButton from '../../../shared/ui/text-button';
import { AboutProps } from '../types/about';
import '../styles/about.scss';

/**
 * Компонент модального окна о проекте.
 *
 * Отображает модальное окно с текстом о проекте.
 * Содержит: логотип, название проекта, текущую версию, тк автора, почту автора
 * и копирайт.
 *
 * @param props - Пропсы компонента.
 * @returns JSX элемент модального окна о проекте.
 *
 * @example
 * <About
 *   isOpened={isOpen}
 *   setOpened={setOpen}
 * />
 */
function About({ isOpened, setOpened }: AboutProps) {
  const dispatch = useDispatch();
  const { t } = useLingui();

  /**
   * Универсальный обработчик для открытия внешних ссылок.
   *
   * @param url - URL-адрес.
   */
  const handleOpenExternal = async (url: string) => {
    const isTauri =
      typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    if (isTauri) {
      try {
        await openUrl(url);
        return;
      } catch (error) {
        callANotificationWithALog(dispatch, t`Error Tauri opener`, error);
      }
    }

    // Синхронный запуск для обычного браузера
    if (url.startsWith('mailto:')) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Popup
      isOpened={isOpened}
      styleWrapper={{ maxWidth: '30.4352%' }}
      setOpened={setOpened}>
      <div className='about'>
        <div className='about__logo-wrapper'>
          <img src={logo} alt='Underlator logo' className='about__logo' />
        </div>
        <h2 className='text-heading-m about__title'>Underlator</h2>
        <p className='text-body-m about__text'>{`v${packageJson.version}`}</p>
        <TextButton
          text={'github'}
          onClick={() =>
            handleOpenExternal('https://github.com/sengeer/underlator-oxide')
          }
          TextButton
        />
        <p className='text-body-m about__text'>
          <Trans>author:</Trans>
          &nbsp;
          <TextButton
            text={'sengeer'}
            onClick={() => handleOpenExternal('https://t.me/Sengeer')}
            TextButton
          />
        </p>
        <p className='text-body-m about__text'>
          <Trans>contact:</Trans>
          &nbsp;
          <TextButton
            text={'fox8911@gmail.com'}
            onClick={() => handleOpenExternal('mailto:fox8911@gmail.com')}
            TextButton
          />
        </p>
        <p className='text-body-m about__text'>
          <CopyrightIcon />
          &nbsp;
          {`${new Date().getFullYear()} Underlator`}
        </p>
      </div>
    </Popup>
  );
}

export default About;
