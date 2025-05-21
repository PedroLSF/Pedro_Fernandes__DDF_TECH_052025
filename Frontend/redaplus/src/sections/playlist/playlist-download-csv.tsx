import { useState, useEffect } from 'react';

import useFetchOnce from 'src/hooks/useFetchOnce';

import { endpoints } from 'src/utils/axios';
import { openSpreadSheetInNewWindow } from 'src/utils/csv';

import { useSnackbar } from 'src/components/snackbar';

import { video_types, PaginatedIVideoPlaylist } from 'src/types/video';

type Props = {
  playlistId: string;
  playlistName: string;
  onClose: () => void;
};

export default function PlaylistDownloadCsv({ playlistId, playlistName, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { data: videosData } = useFetchOnce<PaginatedIVideoPlaylist>(
    endpoints.videoPlaylist.list(playlistId),
    {
      params: {
        take: 50,
        skip: 0,
      },
    }
  );

  const [videosPlaylist, setVideosPlaylist] = useState<PaginatedIVideoPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videosData && videosData !== videosPlaylist) {
      setVideosPlaylist(videosData);
      setLoading(false);
    }
  }, [videosData, videosPlaylist]);

  useEffect(() => {
    if (loading || !videosPlaylist) {
      return;
    }

    if (!videosPlaylist?.results.length) {
      enqueueSnackbar('Não há vídeos na playlist', { variant: 'error' });
      onClose();
      return;
    }

    const csvData = [
      ['id', 'descricao', 'id_video'],
      ...videosPlaylist.results.map((item) => {
        const { video } = item;
        const videoTitle = video?.title || 'Erro ao carregar title';
        const id = video?.id || 'Erro ao carregar identificador';

        const titleWithoutExtension = video_types.reduce((acc, ext) => {
          if (acc.endsWith(ext)) {
            return acc.slice(0, -ext.length);
          }
          return acc;
        }, videoTitle.trim());

        return ['', titleWithoutExtension || 'Erro ao carregar title', id];
      }),
    ];

    openSpreadSheetInNewWindow(csvData, playlistName);
    onClose();
  }, [videosPlaylist, loading, enqueueSnackbar, playlistName, onClose]);

  return null;
}
