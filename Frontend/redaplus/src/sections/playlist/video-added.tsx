import { Draggable, Droppable, DropResult, DragDropContext } from '@hello-pangea/dnd';
import React, { useMemo, Dispatch, useState, useEffect, useCallback, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Card, { CardProps } from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
import { Chip, Button, Tooltip, useTheme, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { categoryPath } from 'src/utils/categoryPath';
import { openSpreadSheetInNewWindow } from 'src/utils/csv';

import Iconify from 'src/components/iconify';

import { IChannel } from 'src/types/channel';
import { ICategory } from 'src/types/category';
import { IVideo, video_types } from 'src/types/video';
import { stateIcons, VideoStatus, contentStatusTranslation } from 'src/types/content';

import { removeExtension } from '../../utils/video';
import { IPlaylistItem } from '../../types/playlist';
import VideoPreview from '../raw-content/video-preview';
import PlaylistCopyDialog from './playlist-copy-dialog';
import PlaylistEmbedDialog from './playlist-embed-dialog';
import ChannelThumbnail from '../channel/channel-thumbnail';
import { getRootCategory } from '../../utils/getCategoryId';
import TableSkeleton from '../../components/table/table-skeleton';

// ----------------------------------------------------------------------

type ItemProps = IVideo;

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  list: ItemProps[];
  setSelected: Dispatch<SetStateAction<ItemProps[]>>;
  setPicked: Dispatch<SetStateAction<ItemProps[]>>;
  setAddOrRemove: Dispatch<SetStateAction<string>>;
  currentChannel?: IChannel | undefined;
  currentPlaylist: IPlaylistItem;
  allowed_categories: Partial<ICategory>[] | undefined;
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
  allowed_categories,
  setPicked,
  isLoading = false,
  ...other
}: Props) {
  const [disabledState, setDisabledState] = useState<{ [key: string]: boolean }>({});
  const [items, setItems] = useState<ItemProps[]>(list);

  const embedDetails = useBoolean();
  const details = useBoolean();

  const copyPlaylist = useBoolean();

  const handleEmbedDetails = useCallback(() => {
    embedDetails.onTrue();

    setTimeout(() => {
      details.onFalse();
    }, 50);
  }, [embedDetails, details]);

  useEffect(() => {
    setItems(list);
  }, [list]);

  const handleDisableChange = useCallback((newsId: string, isDisabled: boolean) => {
    setDisabledState((prev) => ({ ...prev, [newsId]: isDisabled }));
  }, []);

  const onDragEnd = useCallback(
    async ({ destination, source }: DropResult) => {
      if (!destination) {
        return;
      }
      if (destination.index === source.index) {
        return;
      }

      const newItems = Array.from(items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);

      setItems(newItems);
      setPicked(newItems);
    },
    [items, setPicked]
  );

  const csvData = useMemo(() => {
    const data = [['id', 'descricao', 'id_video']];

    items.forEach((item) => {
      const videoTitle = item.title || 'Erro ao carregar title';
      const id = item.id || 'Erro ao carregar identificador';

      const titleWithoutExtension = video_types.reduce((acc: any, ext: string) => {
        if (acc.endsWith(ext)) {
          return acc.slice(0, -ext.length);
        }
        return acc;
      }, videoTitle.trim());

      data.push(['', titleWithoutExtension || 'Erro ao carregar title', id]);
    });

    return data;
  }, [items]);

  const removeAllFromPicked = () => {
    setSelected([...list]);
    setAddOrRemove('removeAll');
  };
  const handleRemoveFromPicked = (item: ItemProps) => {
    setSelected([item]);
    setAddOrRemove('remove');
  };

  return (
    <>
      <Card {...other}>
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
          <CardHeader
            title={
              <Box>
                <div>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'gray' }}>{list.length} vídeos</div>
              </Box>
            }
            subheader={subheader}
            sx={{ mb: 1 }}
          />

          <Box>
            <Button
              data-cy={`copy-playlist-button-${currentPlaylist.id}`}
              onClick={copyPlaylist.onTrue}
              sx={{
                pt: 0,
                px: 0,
                mt: 2,
                cursor: 'default',
                width: '100px',
                minWidth: 0,
              }}
            >
              <Chip
                data-cy={`copy-playlist-chip-${currentPlaylist.id}`}
                size="small"
                variant="outlined"
                label="Copiar"
                sx={{
                  float: 'left',
                  border: 'none',
                  alignContent: 'center',
                  mt: 1,
                  justifyContent: 'center',
                  pt: 0,
                }}
                icon={
                  <Iconify
                    data-cy={`copy-playlist-${currentPlaylist.id}`}
                    icon="eva:copy-fill"
                    sx={{ width: 13, height: 'auto', p: 0 }}
                  />
                }
              />
            </Button>

            {list.length > 0 && (
              <>
                <Button
                  variant="contained"
                  data-cy="user-save"
                  onClick={() => openSpreadSheetInNewWindow(csvData, currentPlaylist.name)}
                  sx={{ marginTop: 2, marginRight: 0 }}
                >
                  Baixar CSV
                </Button>

                <Button
                  onClick={handleEmbedDetails}
                  sx={{
                    pt: 0,
                    px: 0,
                    mt: 2,
                    cursor: 'default',
                    width: '100px',
                    minWidth: 0,
                  }}
                >
                  <Chip
                    data-cy={`playlist-view-embed-${currentPlaylist.id}`}
                    size="small"
                    variant="outlined"
                    label="Embed"
                    sx={{
                      float: 'left',
                      border: 'none',
                      alignContent: 'center',
                      mt: 1,
                      justifyContent: 'center',
                      pt: 0,
                    }}
                    icon={
                      <Iconify
                        icon="solar:wad-of-money-bold"
                        color="gray"
                        sx={{ width: 13, height: 'auto', p: 0 }}
                      />
                    }
                  />
                </Button>

                <IconButton
                  disabled={Object.values(disabledState).some((item) => item)}
                  color="error"
                  onClick={removeAllFromPicked}
                  sx={{ marginTop: 2, marginRight: 2 }}
                >
                  <Iconify
                    icon="solar:trash-bin-trash-bold"
                    data-cy="remove-all-trash-video-added"
                  />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="videos">
            {(droppableProvided) => (
              <Box
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
                sx={{ height: 1065, overflowY: 'auto' }}
              >
                {isLoading ? (
                  <Table>
                    <TableBody>
                      {Array.from({ length: list.length }).map((_, index) => (
                        <TableSkeleton key={index} />
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  items.map((news, index) => (
                    <Draggable key={news.id} draggableId={news.id} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <NewsItem
                            news={news}
                            onRemoveFromPicked={handleRemoveFromPicked}
                            currentChannel={currentChannel}
                            currentPlaylist={currentPlaylist}
                            allowed_categories={allowed_categories}
                            onDisableChange={handleDisableChange}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))
                )}
                {droppableProvided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Card>
      <PlaylistEmbedDialog
        currentPlaylist={currentPlaylist}
        open={embedDetails.value}
        onClose={embedDetails.onFalse}
      />

      {copyPlaylist.value && (
        <PlaylistCopyDialog
          currentPlaylist={currentPlaylist}
          open={copyPlaylist.value}
          onClose={copyPlaylist.onFalse}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

type NewsItemProps = {
  news: ItemProps;
  onRemoveFromPicked: (item: ItemProps) => void;
  currentChannel?: IChannel | undefined;
  currentPlaylist?: IPlaylistItem | undefined;
  allowed_categories: Partial<ICategory>[] | undefined;
  onDisableChange: (newsId: string, isDisabled: boolean) => void;
};

function NewsItem({
  news,
  onRemoveFromPicked,
  currentChannel,
  currentPlaylist,
  allowed_categories,
  onDisableChange,
}: NewsItemProps) {
  const { title, category } = news;
  const preview = useBoolean();
  const theme = useTheme();

  const handleRemoveFromPicked = () => {
    onRemoveFromPicked(news);
  };

  const getCategory = getRootCategory(category);

  // TODO -  Check to obtain the ID
  const isDisabled = !allowed_categories?.find(
    (categorySelected) => categorySelected.id === getCategory?.id
  );

  useEffect(() => {
    onDisableChange(news.id, isDisabled);
  }, [isDisabled, news.id, onDisableChange]);

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
        <Box sx={{ zIndex: 10, position: 'relative', cursor: 'grab' }}>
          <Tooltip title="Arraste para ordenar" arrow>
            <Iconify
              icon="lsicon:drag-filled"
              data-cy={`dnd-${title}-video-picker`}
              sx={{
                color: 'gray',
                position: 'absolute',
                width: 30,
                height: 30,
                bottom: 12,
                right: -10,
                zIndex: 10,
              }}
            />
          </Tooltip>
        </Box>
        <Box>
          <ChannelThumbnail
            sx={{
              width: '100%',
              height: 'auto',
            }}
            item={news}
            currentThumb={currentChannel?.thumb ?? currentPlaylist?.thumb}
          />
        </Box>
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
        <VideoPreview currentContent={news} open={preview.value} onClose={preview.onFalse} />

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
                {!isDisabled && (
                  <Button
                    onClick={preview.onTrue}
                    sx={{
                      pt: 0,
                      px: 0,
                      cursor: 'default',
                      width: '65px',
                      minWidth: 0,
                    }}
                    disabled={isDisabled}
                  >
                    <Chip
                      data-cy={`raw-video-preview-${news.id}`}
                      size="small"
                      variant="outlined"
                      label="Prévia"
                      sx={{
                        float: 'left',
                        border: 'none',
                        alignContent: 'center',
                        mt: 1,
                        justifyContent: 'center',
                        pt: 0,
                      }}
                      icon={
                        <Iconify
                          icon="tabler:player-play-filled"
                          color="gray"
                          sx={{
                            width: 13,
                            height: 'auto',
                            p: 0,
                          }}
                        />
                      }
                    />
                  </Button>
                )}
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
          <IconButton
            color="error"
            onClick={() => {
              handleRemoveFromPicked();
            }}
            disabled={isDisabled}
          >
            <Iconify icon="solar:trash-bin-trash-bold" data-cy={`remove-${title}-video-picker`} />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
}
