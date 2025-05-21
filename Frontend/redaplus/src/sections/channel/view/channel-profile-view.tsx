'use client';

import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import { Tab, Tabs, Switch, FormGroup, FormControlLabel } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useFilter } from 'src/hooks/use-filter';
import useFetchOnce from 'src/hooks/useFetchOnce';
import { useCancelableAxios } from 'src/hooks/useCancelRequest';

import { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import TableToolbar from 'src/components/table/table-toolbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PlaylistListView from 'src/sections/playlist/view/playlist-list-view';

import { IChannel } from 'src/types/channel';
import { PermissionSlug } from 'src/types/role';
import { SchemaFilters } from 'src/types/generic';
import { IVideo, IVideoFilters } from 'src/types/video';
import { IPaginated, defaultPaginated } from 'src/types/pagination';

import ChannelProfileHero from '../channel-profile-hero';
import ChannelProfileVideoList from '../channel-profile-video-list';

// ----------------------------------------------------------------------

const defaultFilters: any = {
  title: '',
  end_date: null,
  start_date: null,
  active: '',
  category_id: null,
};

const schema: SchemaFilters[] = [
  {
    name: 'start_date',
    label: 'Data Inicial',
    type: 'date',
    dataCy: 'initial-date-filters',
  },
  {
    name: 'end_date',
    label: 'Data Final',
    type: 'date',
    dataCy: 'final-date-filters',
  },
  {
    name: 'name',
    placeholder: 'Digitar...',
    type: 'text',
    dataCy: 'type-content-search',
  },
  {
    name: 'category_id',
    type: 'category',
  },
];

type Props = {
  id: string;
};

export default function ChannelProfileView({ id }: Props) {
  const settings = useSettingsContext();
  const { currentEntity, can } = useAuthContext();

  const TABS = [
    {
      value: 'videos',
      label: 'Videos',
      hidden: !can(PermissionSlug['view-content']),
      icon: <Iconify icon="mdi-light:play" width={24} />,
    },
    {
      value: 'playlist',
      label: 'Playlist',
      hidden: !can(PermissionSlug['view-playlists']),
      icon: <Iconify icon="material-symbols-light:playlist-add" />,
    },
  ];

  const [currentTab, setCurrentTab] = useState('videos');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<IPaginated<IVideo>>(defaultPaginated);

  const [rowsPerPage, setRowsPerPage] = useState(50);

  const { data: channelData, mutate } = useFetchOnce<IChannel>(endpoints.channel.get(id));

  const [hideThumb, setHideThumb] = useState<boolean>(false);
  const { fetchWithCancel } = useCancelableAxios();

  const { filters, handleFilterChange, applyFilters, resetFilters } = useFilter<IVideoFilters>({
    initialFilters: defaultFilters,
    handler: async (filter) => {
      const response = await fetchWithCancel(endpoints.video.list, {
        method: 'GET',
        params: {
          take: rowsPerPage,
          skip: currentPage * rowsPerPage,
          filter: {
            channel_id: id,
            ...filter,
          },
        },
      });
      setData(response);
    },
  });

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null) => {
      if (event?.currentTarget?.name === 'previous-button') {
        if (currentPage !== data?.totalPages) {
          setCurrentPage((prev) => prev - 1);
        }
      }

      if (event?.currentTarget?.name === 'next-button') {
        if (currentPage <= data?.totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      }
    },

    [currentPage, data?.totalPages]
  );

  const handleChangeHideThumb = useCallback(() => {
    setHideThumb(!hideThumb);
  }, [hideThumb]);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      // Don't change that value
      setCurrentPage(0);
    },
    []
  );

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentPage, rowsPerPage]);

  useEffect(() => {
    resetFilters();
    applyFilters({
      category_id: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity]);

  const renderVideos = (
    <>
      <TableToolbar
        setShowFiltersResults={() => {}}
        filters={filters}
        schema={schema}
        onFilters={handleFilterChange}
        applyFilters={applyFilters}
        filter_in_channel
      />

      <Card sx={{ p: 2, my: 2 }}>
        <Stack direction="column" gap={1}>
          <Typography variant="subtitle1" mx={1}>
            Total de vídeos do canal: {data?.total}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={hideThumb}
                  onChange={handleChangeHideThumb}
                  data-cy="compact-switch-channel-profile"
                />
              }
              label="Compacto"
            />
          </FormGroup>
        </Stack>
      </Card>

      <ChannelProfileVideoList
        data={data.results}
        thumb={channelData?.thumb?.image_url || '/assets/images/videos/placeholder-video.png'}
        onChange={applyFilters}
        hideThumb={hideThumb}
      />

      {data?.total > 0 && (
        <Stack
          sx={{
            alignItems: 'flex-end',
            justifyItems: 'center',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TablePagination
            component="div"
            count={data?.total}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[50, 100, 200]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página"
            dir="ltr"
            labelDisplayedRows={(page) => `${page.from}-${page.to} de ${page.count}`}
            slotProps={{
              actions: {
                nextButton: { name: 'next-button' },
                previousButton: { name: 'previous-button' },
              },
            }}
          />
        </Stack>
      )}
    </>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Perfil do canal"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Lista de Canais',
            href: paths.dashboard.channel.list,
          },
          { name: channelData?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {channelData && <ChannelProfileHero data={channelData} mutate={mutate} />}

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
          mt: 2,
        }}
      >
        {TABS.filter((tab) => !tab.hidden).map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} icon={tab.icon} />
        ))}
      </Tabs>

      {currentTab === 'videos' && renderVideos}
      {can(PermissionSlug['view-playlists']) && currentTab === 'playlist' && <PlaylistListView />}
    </Container>
  );
}
