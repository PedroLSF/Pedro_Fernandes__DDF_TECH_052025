import { Dispatch, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Card, { CardProps } from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import TablePagination from '@mui/material/TablePagination';
import { Tooltip, useTheme, Typography } from '@mui/material';

import { categoryPath } from 'src/utils/categoryPath';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { IChannel } from 'src/types/channel';
import { IVideo, VideoStatus } from 'src/types/video';
import { stateIcons, contentStatusTranslation } from 'src/types/content';

import ChannelThumbnail from './channel-thumbnail';
import { removeExtension } from '../../utils/video';
import { IPlaylistItem } from '../../types/playlist';
import TableSkeleton from '../../components/table/table-skeleton';

// ----------------------------------------------------------------------

type ItemProps = IVideo;

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  list: ItemProps[];
  setSelected: Dispatch<SetStateAction<ItemProps[]>>;
  setAddOrRemove: Dispatch<SetStateAction<string>>;
  currentChannel?: IChannel | undefined;
  currentPlaylist?: IPlaylistItem | undefined;
  paginationControl: {
    totalAdded: number;
    currentPageAdded: number;
    handleChangePageAdded: (event: React.MouseEvent<HTMLButtonElement> | null) => void;
    rowsPerPageAdded: number;
    handleChangeRowsPerPageAdded: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
  };
  isLoading?: boolean;
}

export default function VideoAdded({
  title,
  subheader,
  list,
  setSelected,
  setAddOrRemove,
  currentChannel,
  currentPlaylist,
  paginationControl,
  isLoading = false,
  ...other
}: Props) {
  const removeAllFromPicked = () => {
    setSelected([...list]);
    setAddOrRemove('remove');
  };
  const handleRemoveFromPicked = (item: ItemProps) => {
    setSelected([item]);
    setAddOrRemove('remove');
  };

  return (
    <Card {...other}>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CardHeader title={title} subheader={subheader} sx={{ mb: 1 }} />
        {list.length > 0 && (
          <IconButton
            color="error"
            onClick={removeAllFromPicked}
            sx={{ marginTop: 2, marginRight: 3 }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" data-cy="remove-all-trash-video-added" />
          </IconButton>
        )}
      </Box>
      <Box sx={{ height: 1000 }}>
        <Scrollbar data-cy="scroll-video-added">
          {isLoading ? (
            <Table>
              <TableBody>
                {Array.from({ length: paginationControl.rowsPerPageAdded }).map((_, index) => (
                  <TableSkeleton key={index} />
                ))}
              </TableBody>
            </Table>
          ) : (
            list.map((news) => (
              <NewsItem
                key={news.id}
                news={news}
                onRemoveFromPicked={handleRemoveFromPicked}
                currentChannel={currentChannel}
                currentPlaylist={currentPlaylist}
              />
            ))
          )}
        </Scrollbar>
      </Box>

      <Stack
        sx={{
          alignItems: 'flex-end',
          justifyItems: 'flex-start',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <TablePagination
          component="div"
          count={paginationControl.totalAdded}
          page={paginationControl.currentPageAdded}
          onPageChange={paginationControl.handleChangePageAdded}
          rowsPerPage={paginationControl.rowsPerPageAdded}
          rowsPerPageOptions={[50, 100, 200]}
          onRowsPerPageChange={paginationControl.handleChangeRowsPerPageAdded}
          labelRowsPerPage="Linhas por página"
          dir="ltr"
          labelDisplayedRows={(page) =>
            `${Math.min(page.from, page.count)}-${Math.min(page.to, page.count)} de ${page.count}`
          }
          slotProps={{
            actions: {
              nextButton: { name: 'next-button-added' },
              previousButton: { name: 'previous-button-added' },
            },
          }}
        />
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type NewsItemProps = {
  news: ItemProps;
  onRemoveFromPicked: (item: ItemProps) => void;
  currentChannel?: IChannel | undefined;
  currentPlaylist?: IPlaylistItem | undefined;
};

function NewsItem({ news, onRemoveFromPicked, currentChannel, currentPlaylist }: NewsItemProps) {
  const { title } = news;
  const theme = useTheme();

  const handleRemoveFromPicked = () => {
    onRemoveFromPicked(news);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        borderBottom: (themeSelected) => `dashed 1px ${themeSelected.palette.divider}`,
      }}
    >
      <Box
        sx={{
          flex: '0 0 15%',
          display: 'flex',
          justifyContent: 'center',
          ml: 2,
        }}
      >
        <ChannelThumbnail
          sx={{
            width: '100%',
            height: 'auto',
          }}
          item={news}
          currentThumb={currentChannel?.thumb ?? currentPlaylist?.thumb}
        />
      </Box>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        sx={{
          flex: '1 1 85%',
          py: 2,
        }}
      >
        <ListItemText
          primary={removeExtension(title)}
          secondary={
            <Stack direction="column" spacing={0.5} sx={{ pt: 0, typography: 'caption' }}>
              <Box
                display="flex"
                alignItems="center"
                flexWrap="nowrap"
                sx={{ width: '100%', overflow: 'hidden' }}
              >
                <Tooltip title="Situação do encoding do arquivo" placement="top">
                  <Iconify
                    icon={stateIcons[news.status]}
                    sx={{
                      color:
                        news.status === VideoStatus.error
                          ? theme.palette.error.main
                          : theme.palette.primary.main,
                      width: '15px',
                      mr: 0.5,
                    }}
                  />
                </Tooltip>
                <Typography
                  variant="inherit"
                  color="primary"
                  noWrap={false}
                  sx={{ maxWidth: '100%' }}
                >
                  {contentStatusTranslation[news.status]}
                </Typography>
                <Iconify icon="ic:baseline-type-specimen" sx={{ color: 'gray', ml: 1 }} />
                <Typography variant="inherit" noWrap={false} sx={{ maxWidth: '100%' }}>
                  {news.original_file_props?.type}
                </Typography>
              </Box>

              <Stack
                direction="row"
                alignItems="start"
                spacing={0.5}
                sx={{
                  pt: 0,
                  mt: 1,
                  typography: 'caption',
                  wordBreak: 'break-word',
                }}
              >
                <Iconify
                  icon="mdi:label-multiple"
                  sx={{ color: 'gray', minWidth: '18px', width: '18px' }}
                />
                {categoryPath(news.category)}
              </Stack>
            </Stack>
          }
          primaryTypographyProps={{
            typography: 'subtitle2',
          }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
          }}
        />

        <Box sx={{ flexShrink: 0, color: 'text.disabled', typography: 'caption', pr: 3 }}>
          <IconButton color="error" onClick={handleRemoveFromPicked}>
            <Iconify icon="solar:trash-bin-trash-bold" data-cy={`remove-${title}-video-picker`} />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
}
