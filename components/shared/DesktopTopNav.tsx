'use client';

import {
  ShellBar,
  ShellBarItem,
  Avatar,
  Input,
  TabContainer,
  Tab,
  SuggestionItem,
  Icon
} from '@ui5/webcomponents-react';
import { useState, useMemo } from 'react';

import "@ui5/webcomponents/dist/Switch.js";
import "@ui5/webcomponents/dist/Popover.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";
import "@ui5/webcomponents-fiori/dist/NotificationListItem.js";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/ListItemStandard.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Avatar.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents/dist/Label.js";

// Icons
import "@ui5/webcomponents-icons/dist/date-time.js";
import "@ui5/webcomponents-icons/dist/globe.js";
import "@ui5/webcomponents-icons/dist/palette.js";
import "@ui5/webcomponents-icons/dist/settings.js";
import "@ui5/webcomponents-icons/dist/sys-help.js";
import "@ui5/webcomponents-icons/dist/log.js";
import "@ui5/webcomponents-icons/dist/search.js";

// Tab Prefix Icons
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/bbyd-dashboard.js";
import "@ui5/webcomponents-icons/dist/calendar.js";
import "@ui5/webcomponents-icons/dist/workflow-tasks.js";
import "@ui5/webcomponents-icons/dist/sap-box.js";
import "@ui5/webcomponents-icons/dist/move.js";
import "@ui5/webcomponents-icons/dist/lead.js";
import "@ui5/webcomponents-icons/dist/building.js";
import "@ui5/webcomponents-icons/dist/dimension.js";
import "@ui5/webcomponents-icons/dist/history.js";
import "@ui5/webcomponents-icons/dist/money-bills.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/map.js";
import "@ui5/webcomponents-icons/dist/employee.js";
import "@ui5/webcomponents-icons/dist/shipping-status.js";
import "@ui5/webcomponents-icons/dist/bar-chart.js";
import "@ui5/webcomponents-icons/dist/iphone.js";
import "@ui5/webcomponents-icons/dist/product.js";
import "@ui5/webcomponents-icons/dist/document.js";
import "@ui5/webcomponents-icons/dist/phone.js";

import { SHELL_TABS, getShellTabName } from '@/lib/shell/navigation';
import { useShellActions } from '@/hooks/useShellActions';
import ShellPopovers from '@/components/shared/ShellPopovers';
import { useRouter, usePathname } from 'next/navigation';

const DesktopTopNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const tabName = getShellTabName(pathname);

  // Hide on login page
  if (pathname === '/login' || pathname === '/') return null;

  const navigate = (path: string) => {
      router.push(path);
  };
  const {
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
  } = useShellActions();

  const [searchTerm, setSearchTerm] = useState('');

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const results: any[] = [];
    const lowerTerm = searchTerm.toLowerCase();

    SHELL_TABS.forEach(tab => {
      if (tab.label.toLowerCase().includes(lowerTerm)) {
        results.push({
          id: tab.route,
          text: tab.label,
          description: `Navigate to ${tab.label}`,
          icon: 'navigation'
        });
      }
    });

    return results.slice(0, 10);
  }, [searchTerm]);

  const onSearchInput = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const onSuggestionSelect = (e: any) => {
    const selectedRoute = e.detail.item.getAttribute('data-id');
    if (selectedRoute !== null) {
        navigate(`/${selectedRoute}`);
        setSearchTerm('');
    }
  };

  return (
    <div className="app-bar hidden md:block w-full z-50">
      <ShellBar
        ref={appBarRef}
        primaryTitle="Van Sales PW"
        showNotifications
        notificationsCount="3"
        onProfileClick={onProfileClicked}
        onNotificationsClick={onNotificationsClicked}
        logo={<Avatar initials="SS" colorScheme="Accent6" />}
        searchField={
            <Input 
                placeholder="Search Menu (GRN, Drivers, Vehicles)..." 
                showSuggestions
                value={searchTerm}
                onInput={onSearchInput}
                {...({ onSuggestionItemSelect: onSuggestionSelect } as any)}
                icon={<Icon name="search" />}
                style={{ width: '280px' }}
            >
                {suggestions.map(s => (
                    <SuggestionItem 
                        key={`${s.id}-${s.text}`} 
                        {...({
                            text: s.text,
                            description: s.description,
                            icon: s.icon,
                            'data-id': s.id
                        } as any)}
                    />
                ))}
            </Input>
        }
        profile={
          <Avatar initials="SV" colorScheme="Accent1" />
        }
      >
        <ShellBarItem icon="date-time" text="Timezone" onClick={onTimezoneSettings} />
        <ShellBarItem icon="globe" text="Language" onClick={onLangSettings} />
        <ShellBarItem icon="palette" text="Theme" onClick={onThemeSettings} />
      </ShellBar>

      <div className="w-full flex justify-center border-b border-[var(--sapPageHeader_BorderColor, #e4e4e4)] bg-[var(--sapObjectHeader_Background, #ffffff)] shadow-sm">
        <div className="w-fit">
          <TabContainer collapsed ref={tabContainerRef} onTabSelect={(event: any) => onTabSelect(event, navigate)}>
            {SHELL_TABS.map((tab) => (
              <Tab
                key={tab.route || 'home'}
                text={tab.label}
                icon={tab.icon}
                data-navigate={tab.route}
                selected={tabName === tab.label}
              />
            ))}
          </TabContainer>
        </div>
      </div>

      <ShellPopovers
        timezonePopoverRef={timezonePopoverRef}
        themePopoverRef={themePopoverRef}
        langPopoverRef={langPopoverRef}
        profilePopoverRef={profilePopoverRef}
        notificationsPopoverRef={notificationsPopoverRef}
        rtlSwitchRef={rtlSwitchRef}
        contentDensitySwitchRef={contentDensitySwitchRef}
        tzPopoverOpen={tzPopoverOpen}
        setTzPopoverOpen={setTzPopoverOpen}
        onDirChange={onDirChange}
        onContentDensityChange={onContentDensityChange}
        onLangChange={onLangChange}
        onThemeChange={onThemeChange}
        onTimezoneChange={onTimezoneChange}
        theme={appTheme}
      />
    </div>
  );
};

export default DesktopTopNav;
