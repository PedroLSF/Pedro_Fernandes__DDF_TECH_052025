'use client';

import React, { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import useFetch from 'src/hooks/useFetch';

import { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IUserItem } from 'src/types/user';

import UserGeneral from '../user-general';
import UserNotifications from '../user-notifications';
import UserChangePassword from '../user-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'Geral',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
    dataCy: 'user-submenu-option-general',
  },
  {
    value: 'notifications',
    label: 'Notificações',
    icon: <Iconify icon="solar:bell-bing-bold" width={24} />,
    dataCy: 'user-submenu-option-notifications',
  },
  {
    value: 'security',
    label: 'Segurança',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
    dataCy: 'user-submenu-option-security',
  },
];

type Props = {
  id: string;
};

// ----------------------------------------------------------------------

export default function UserProfileView({ id }: Props) {
  const settings = useSettingsContext();

  const {
    data: currentUser,
    isLoading,
    mutate,
  } = useFetch<IUserItem>(endpoints.user.getProfile(id));

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  if (isLoading || !currentUser) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Perfil"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Usuário',
            href: paths.dashboard.user.list,
          },
          { name: currentUser?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            icon={tab.icon}
            value={tab.value}
            data-cy={tab.dataCy}
          />
        ))}
      </Tabs>

      {currentTab === 'general' && <UserGeneral currentUser={currentUser} />}

      {currentTab === 'notifications' && (
        <UserNotifications currentUser={currentUser} mutate={mutate} />
      )}

      {currentTab === 'security' && <UserChangePassword />}
    </Container>
  );
}
