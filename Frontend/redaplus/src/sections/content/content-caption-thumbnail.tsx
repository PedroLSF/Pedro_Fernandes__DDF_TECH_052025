import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Iconify from 'src/components/iconify';

import {
  IVideoTrack,
  IContentItem,
  VideoTrackKind,
  VideoTrackLang,
  VideoTrackStatus,
  stateIconsSubtitle,
  contentStatusTranslationSubtitle,
} from 'src/types/content';

// ----------------------------------------------------------------------

type Props = {
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (track: IVideoTrack) => void;
  item: IContentItem;
};

export default function ContentCaptionThumbnail({ onDownload, onDelete, onEdit, item }: Props) {
  if (!item.tracks) {
    return null;
  }

  return item.tracks
    .sort((a, b) => Number(b.is_default) - Number(a.is_default))
    .map((track) => (
      <Stack
        key={track.id}
        direction="column"
        alignItems="start"
        flexWrap="wrap"
        gap={1}
        sx={{ p: 2.5, mt: 1.5 }}
        bgcolor="background.neutral"
      >
        <Chip
          size="medium"
          variant="soft"
          label={track.label}
          sx={{ float: 'left' }}
          icon={<Iconify icon="eva:attach-2-fill" />}
          data-cy="chip-video-track-label"
        />

        <Box>
          {track.is_default ? (
            <Chip
              size="small"
              variant="soft"
              label="padrão"
              sx={{ float: 'left', mr: 1 }}
              icon={<Iconify icon="pajamas:issue-type-feature" color="yellow" />}
              data-cy="chip-video-track-is_default"
            />
          ) : null}

          <Chip
            size="small"
            variant="soft"
            label={VideoTrackLang[track.lang as unknown as keyof typeof VideoTrackLang]}
            sx={{ float: 'left', mr: 1 }}
            icon={<Iconify icon="material-symbols:language" />}
            data-cy="chip-video-track-lang"
          />

          <Chip
            size="small"
            variant="soft"
            label={VideoTrackKind[track.kind as unknown as keyof typeof VideoTrackKind]}
            sx={{ float: 'left', mr: 1 }}
            icon={<Iconify icon="material-symbols:type-specimen-sharp" />}
            data-cy="chip-video-track-kind"
          />

          <Chip
            size="small"
            variant="soft"
            label={
              contentStatusTranslationSubtitle[
                track.status as unknown as keyof typeof VideoTrackStatus
              ]
            }
            sx={{ float: 'left', mr: 1 }}
            icon={
              <Iconify
                icon={stateIconsSubtitle[track.status as unknown as keyof typeof VideoTrackStatus]}
              />
            }
            data-cy="chip-video-track-kind"
          />

          {(track.status === VideoTrackStatus.none ||
            track.status === VideoTrackStatus.subtitle_generated) &&
            (track.approved_by ? (
              <Chip
                size="small"
                variant="soft"
                label={`Aprovado por ${track.approvedByUser?.name}`}
                sx={{ float: 'left' }}
                icon={<Iconify icon={stateIconsSubtitle.subtitle_generated} />}
                data-cy="chip-video-track-kind"
              />
            ) : (
              <Chip
                size="small"
                variant="soft"
                label="Aguardando aprovação da Legenda (IA)"
                sx={{ float: 'left' }}
                icon={<Iconify icon={stateIconsSubtitle.waiting_subtitle} />}
                data-cy="chip-video-track-kind"
              />
            ))}
        </Box>

        <Box>
          <Button
            size="small"
            disabled={!onDownload}
            variant="contained"
            startIcon={<Iconify icon="mingcute:download-3-fill" />}
            onClick={() => onDownload?.(track.id)}
            data-cy="video-track-download-button"
            sx={{ mr: 1 }}
          >
            Download
          </Button>

          <Button
            size="small"
            disabled={!onDelete}
            onClick={() => onDelete?.(track.id)}
            variant="contained"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold-duotone" />}
            data-cy="video-track-delete-button"
            sx={{ mr: 1 }}
          >
            Remover
          </Button>

          <Button
            size="small"
            disabled={!onEdit}
            onClick={() => onEdit?.(track)}
            variant="contained"
            startIcon={<Iconify icon="mdi:file-edit-outline" />}
            data-cy="video-track-edit-button"
          >
            Editar
          </Button>
        </Box>
      </Stack>
    ));
}
