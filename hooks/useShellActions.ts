'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { setLanguage } from '@ui5/webcomponents-base/dist/config/Language.js';
import { setTimezone } from '@ui5/webcomponents-base/dist/config/Timezone.js';
import applyDirection from '@ui5/webcomponents-base/dist/locale/applyDirection.js';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';

function openPopover(popoverRef: RefObject<any>, targetRef: any) {
  if (!popoverRef.current) return;
  popoverRef.current.opener = targetRef;
  popoverRef.current.open = true;
}

export function useShellActions() {
  const appBarRef = useRef<any>(null);
  const timezonePopoverRef = useRef<any>(null);
  const themePopoverRef = useRef<any>(null);
  const langPopoverRef = useRef<any>(null);
  const profilePopoverRef = useRef<any>(null);
  const notificationsPopoverRef = useRef<any>(null);
  const rtlSwitchRef = useRef<any>(null);
  const contentDensitySwitchRef = useRef<any>(null);
  const tabContainerRef = useRef<any>(null);
  const [tzPopoverOpen, setTzPopoverOpen] = useState(false);
  const [appTheme, setAppTheme] = useState('sap_horizon');

  useEffect(() => {
    setTimezone('Europe/London');
  }, []);

  const onProfileClicked = (event: any) => {
    event.preventDefault();
    openPopover(profilePopoverRef, event.detail.targetRef);
  };

  const onNotificationsClicked = (event: any) => {
    event.preventDefault();
    openPopover(notificationsPopoverRef, event.detail.targetRef);
  };

  const onDirChange = (event: any) => {
    document.body.dir = event.target.checked ? 'rtl' : 'ltr';
    applyDirection();
  };

  const onContentDensityChange = (event: any) => {
    if (event.target.checked) {
      document.body.classList.add('ui5-content-density-compact');
    } else {
      document.body.classList.remove('ui5-content-density-compact');
    }
  };

  const onLangSettings = (event: any) => {
    event.preventDefault();
    openPopover(langPopoverRef, event.detail.targetRef);
  };

  const onLangChange = (event: any) => {
    const selectedLang = event.detail.selectedItems[0].getAttribute('data-lang');
    setLanguage(selectedLang);
    if (langPopoverRef.current) {
      langPopoverRef.current.open = false;
    }
  };

  const onThemeSettings = (event: any) => {
    event.preventDefault();
    openPopover(themePopoverRef, event.detail.targetRef);
  };

  const onThemeChange = (event: any) => {
    const selectedTheme = event.detail.selectedItems[0].getAttribute('data-theme');
    setTheme(selectedTheme);
    setAppTheme(selectedTheme);
    if (themePopoverRef.current) {
      themePopoverRef.current.open = false;
    }
  };

  const onTimezoneSettings = (event: any) => {
    event.preventDefault();
    openPopover(timezonePopoverRef, event.detail.targetRef);
    setTzPopoverOpen(true);
  };

  const onTimezoneChange = (event: any) => {
    const newTimezone = event.detail.selectedItems[0].getAttribute('data-timezone');
    setTimezone(newTimezone);
    setTzPopoverOpen(false);
  };

  const onTabSelect = (event: any, navigate: (path: string) => void) => {
    const { tab } = event.detail;
    navigate(`/${tab.getAttribute('data-navigate')}`);
  };

  return {
    appBarRef,
    timezonePopoverRef,
    themePopoverRef,
    langPopoverRef,
    profilePopoverRef,
    notificationsPopoverRef,
    rtlSwitchRef,
    contentDensitySwitchRef,
    tabContainerRef,
    tzPopoverOpen,
    setTzPopoverOpen,
    onProfileClicked,
    onNotificationsClicked,
    onDirChange,
    onContentDensityChange,
    onLangSettings,
    onLangChange,
    onThemeSettings,
    onThemeChange,
    onTimezoneSettings,
    onTimezoneChange,
    onTabSelect,
    appTheme,
  };
}
