import React from 'react';
import {
  Popover,
  List,
  ListItemStandard,
  Title,
  Label,
  Switch,
  NotificationListItem,
  Avatar
} from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';

type ShellPopoversProps = {
  timezonePopoverRef: React.RefObject<any>;
  themePopoverRef: React.RefObject<any>;
  langPopoverRef: React.RefObject<any>;
  profilePopoverRef: React.RefObject<any>;
  notificationsPopoverRef: React.RefObject<any>;
  rtlSwitchRef: React.RefObject<any>;
  contentDensitySwitchRef: React.RefObject<any>;
  tzPopoverOpen: boolean;
  setTzPopoverOpen: (open: boolean) => void;
  onDirChange: (event: any) => void;
  onContentDensityChange: (event: any) => void;
  onLangChange: (event: any) => void;
  onThemeChange: (event: any) => void;
  onTimezoneChange: (event: any) => void;
  theme: string;
};

export default function ShellPopovers({
  timezonePopoverRef,
  themePopoverRef,
  langPopoverRef,
  profilePopoverRef,
  notificationsPopoverRef,
  rtlSwitchRef,
  contentDensitySwitchRef,
  tzPopoverOpen,
  setTzPopoverOpen,
  onDirChange,
  onContentDensityChange,
  onLangChange,
  onThemeChange,
  onTimezoneChange,
  theme,
}: ShellPopoversProps) {
  const router = useRouter();

  const actions = React.useMemo(() => [
    {
      id: 'noti-1',
      title: 'New Picking Task',
      description: 'Urgent picklist assigned for PO-2026-001 in Zone A',
      importance: 'Important' as const,
      icon: 'PT'
    },
    {
      id: 'noti-2',
      title: 'Vehicle Alert',
      description: 'Vehicle V-1002 (Volvo FH16) fuel level below 15%',
      importance: 'Standard' as const,
      icon: 'VA'
    },
    {
      id: 'noti-3',
      title: 'Route Dispatch',
      description: 'Driver John Doe has started transport Route #2026-004',
      importance: 'Standard' as const,
      icon: 'RD'
    }
  ], []);

  const onActionClick = (id: string) => {
    if (id === 'noti-1') {
      router.push('/picklists');
    } else if (id === 'noti-2') {
      router.push('/vehicles');
    } else if (id === 'noti-3') {
      router.push('/routes');
    }
    if (notificationsPopoverRef.current) {
        notificationsPopoverRef.current.close();
    }
  };

  return (
    <>
      <Popover ref={profilePopoverRef} placement="Bottom" horizontalAlign="End">
        <div className="profile-header centered">
          <img src="/img/profile.png" alt="profile" className="profile-img" />
          <Title level="H3">Darius Cummings</Title>
          <Label>Store Manager</Label>
        </div>
        <div className="profile-content">
          <div className="profile-rtl-switch centered">
            <div className="profile-rtl-switch-title">
              <Label className="profile-rtl-switch-text">RTL</Label>
            </div>
            <Switch ref={rtlSwitchRef} onChange={onDirChange} />
          </div>

          <div className="profile-rtl-switch centered">
            <div className="profile-rtl-switch-title">
              <Label className="profile-rtl-switch-text">Compact</Label>
            </div>
            <Switch ref={contentDensitySwitchRef} onChange={onContentDensityChange} />
          </div>

          <List
            separators="None"
            onItemClick={(event: any) => {
              const text = event.detail.item.textContent || '';
              if (text.toLowerCase().includes('sign out')) {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('twms-user');
                }
                if (profilePopoverRef.current) {
                  profilePopoverRef.current.close();
                }
                router.push('/login?reason=logout');
              }
            }}
          >
            <ListItemStandard icon="settings">Settings</ListItemStandard>
            <ListItemStandard icon="sys-help">Help</ListItemStandard>
            <ListItemStandard icon="log">Sign out</ListItemStandard>
          </List>
        </div>
      </Popover>

      <Popover ref={notificationsPopoverRef} placement="Bottom" horizontalAlign="End">
        <List headerText={`Actions Required (${actions.length})`}>
          {actions.length > 0 ? actions.map(action => (
            <NotificationListItem 
                key={`${action.id}-${action.title}`}
                titleText={action.title} 
                importance={action.importance}
                onClick={() => onActionClick(action.id)}
                style={{ cursor: 'pointer' }}
            >
                {action.description}
                <Avatar slot="avatar">
                    <span style={{ fontSize: '1rem' }}>{action.icon}</span>
                </Avatar>
            </NotificationListItem>
          )) : (
            <ListItemStandard>No pending actions</ListItemStandard>
          )}
        </List>
      </Popover>

      <Popover ref={langPopoverRef} placement="Bottom" horizontalAlign="End" headerText="Language">
        <List onSelectionChange={onLangChange} selectionMode="Single">
          <ListItemStandard icon="globe" data-lang="ar">Arabic</ListItemStandard>
          <ListItemStandard icon="globe" data-lang="bg">Bulgarian</ListItemStandard>
          <ListItemStandard icon="globe" data-lang="zh_CN">Chinese</ListItemStandard>
          <ListItemStandard icon="globe" data-lang="de">German</ListItemStandard>
          <ListItemStandard icon="globe" data-lang="en" selected>English</ListItemStandard>
          <ListItemStandard icon="globe" data-lang="es">Spanish</ListItemStandard>
          <ListItemStandard icon="globe" data-lang="iw">Hebrew</ListItemStandard>
        </List>
      </Popover>

      <Popover ref={timezonePopoverRef} open={tzPopoverOpen} onClose={() => setTzPopoverOpen(false)} placement="Bottom" horizontalAlign="End" headerText="Timezone">
        <List onSelectionChange={onTimezoneChange} selectionMode="Single">
          <ListItemStandard icon="globe" data-timezone="Pacific/Honolulu">Pacific/Honolulu</ListItemStandard>

          <ListItemStandard icon="globe" data-timezone="Asia/Tokyo">Asia/Tokyo</ListItemStandard>

        </List>
      </Popover>

      <Popover ref={themePopoverRef} placement="Bottom" horizontalAlign="End" headerText="Theme">
        <List onSelectionChange={onThemeChange} selectionMode="Single">
          <ListItemStandard icon="palette" selected={theme === 'sap_horizon'} data-theme="sap_horizon">Morning Horizon</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_horizon_dark'} data-theme="sap_horizon_dark">Evening Horizon</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_horizon_hcb'} data-theme="sap_horizon_hcb">Horizon HCB</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_horizon_hcw'} data-theme="sap_horizon_hcw">Horizon HCW</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_fiori_3'} data-theme="sap_fiori_3">sap_fiori</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_fiori_3_dark'} data-theme="sap_fiori_3_dark">Quartz Dark</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_fiori_3_hcb'} data-theme="sap_fiori_3_hcb">Quartz HCB</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'sap_fiori_3_hcw'} data-theme="sap_fiori_3_hcw">Quartz HCW</ListItemStandard>
          <ListItemStandard icon="palette" selected={theme === 'redfish'} data-theme="redfish">Red Fish</ListItemStandard>
        </List>
      </Popover>
    </>
  );
}
