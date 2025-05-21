import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import Iconify from '../iconify';
import { varFade } from '../animate';
import Scrollbar from '../scrollbar/scrollbar';
import { CustomFile, UploadProps } from './types';
import { ExtendFile } from '../file-thumbnail/types';
import { useSweetAlert } from '../../utils/sweet-alert';
import FileThumbnail, { fileData } from '../file-thumbnail';
import { UploadProgressStatus } from '../../types/progress';
import UploadProgressBar from '../../sections/upload-content/upload-progress-bar';

// ----------------------------------------------------------------------

type RenderProgressProps = {
  progress: UploadProps['uploadProgress'];
  id?: string;
  context: string | keyof UploadProps['uploadProgress'];
  title: string;
  icon: string;
  restIcon: string;
  color: string;
  hidden?: boolean;
};

export default function MultiFilePreview({
  files,
  onRemove,
  sx,
  uploadProgress,
  hideEncodeProgress,
}: UploadProps) {
  const theme = useTheme();

  const { successAlert } = useSweetAlert();

  let filesToProccess = files?.length;

  const searchParams = useSearchParams();

  const [showedModal, setShowedModal] = useState(false);

  useEffect(() => {}, [showedModal]);

  let canRenderSweetAlert = false;

  let canRenderSweetAlertRaw = false;

  const router = useRouter();

  const redirect = () => {
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo) {
      router.replace(decodeURI(redirectTo));
      return;
    }
    const path = searchParams.get('human_type') ?? 'raw';
    router.push(
      `/dashboard/${path === 'raw' ? 'raw-content' : 'content'}${path === 'raw' ? '?directories=1' : ''}`
    );
  };

  const allDone = (id: string, video_id: string): boolean =>
    uploadProgress?.upload?.[id]?.status === UploadProgressStatus.ok &&
    uploadProgress?.encode_download?.[video_id]?.status === UploadProgressStatus.ok &&
    uploadProgress?.encode?.[video_id]?.status === UploadProgressStatus.ok &&
    uploadProgress?.encode_upload?.[video_id]?.status === UploadProgressStatus.ok;

  const uploadDone = (id: string): boolean =>
    uploadProgress?.upload?.[id]?.status === UploadProgressStatus.ok;

  const renderProgress = ({
    title,
    icon,
    restIcon,
    color,
    progress,
    id,
    context,
    hidden = false,
  }: RenderProgressProps) => {
    const isInProgress = Boolean(
      progress &&
        id &&
        context &&
        context in progress &&
        id in progress[context as keyof typeof progress]
    );

    let currentProgress: number | string = isInProgress
      ? Number(progress?.[context as keyof typeof progress]?.[id ?? 'nothing']?.progress ?? 0)
      : 'aguardando...';
    const currentProgressStatus =
      progress?.[context as keyof typeof progress]?.[id ?? 'nothing']?.status ??
      UploadProgressStatus.pending;
    let currentIcon = isInProgress ? icon : restIcon;
    let currentColor = isInProgress ? color : theme.palette.grey[300];
    if (currentProgressStatus === UploadProgressStatus.ok) {
      currentIcon = 'line-md:circle-to-confirm-circle-transition';
      currentColor = theme.palette.success.main;
    }

    if (currentProgressStatus === UploadProgressStatus.error) {
      currentIcon = 'line-md:close-circle';
      currentColor = theme.palette.error.main;
      currentProgress = 'erro!';
    }

    return hidden ? null : (
      <UploadProgressBar
        sx={{ flex: 0.5, pb: 1 }}
        title={title}
        percent={currentProgress}
        icon={currentIcon}
        color={currentColor}
      />
    );
  };

  return (
    <AnimatePresence initial={false}>
      {files?.map((file) => {
        const { key, name = '', size = 0 } = fileData(file as ExtendFile);

        if (uploadDone((file as ExtendFile).id) && searchParams.get('human_type') !== 'edited') {
          if (filesToProccess) {
            filesToProccess -= 1;
          }
          if (filesToProccess === 0) {
            canRenderSweetAlertRaw = true;
          }
        }

        if (allDone((file as ExtendFile).id, (file as ExtendFile).video_id as string)) {
          if (filesToProccess) {
            filesToProccess -= 1;
          }
          if (filesToProccess === 0) {
            canRenderSweetAlert = true;
          }
        }

        if (canRenderSweetAlert && !showedModal) {
          successAlert({
            title: `${files.length} video(s) carregado(s) com sucesso!`,
            // confirmButtonColor: '#00A76F',
            didOpen() {
              setShowedModal(!showedModal);
            },
          }).then(redirect);
        }

        if (canRenderSweetAlertRaw && !showedModal) {
          successAlert({
            title: `${files.length} arquivo(s) carregado(s) com sucesso!`,
            // confirmButtonColor: '#00A76F',
            didOpen() {
              setShowedModal(!showedModal);
            },
          }).then(redirect);
        }

        const isNotFormatFile = typeof file === 'string';

        return (
          <Scrollbar key={key}>
            <Stack
              component={m.div}
              {...varFade().inUp}
              spacing={2}
              direction="column"
              gap="10px"
              sx={{
                my: 1,
                py: 1,
                px: 1.5,
                borderRadius: 1,
                border: (_theme) => `solid 1px ${alpha(_theme.palette.grey[500], 0.16)}`,
                ...sx,
              }}
            >
              <Stack
                component={m.div}
                {...varFade().inUp}
                spacing={2}
                direction="row"
                alignItems="center"
                sx={{
                  pt: 1,
                  pb: 0,
                  px: 1.5,
                  ...sx,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  divider={
                    <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
                  }
                  sx={{ flex: 0.5 }}
                >
                  <FileThumbnail file={file} sx={{ mr: 2 }} />

                  <ListItemText
                    primary={isNotFormatFile ? file : name}
                    secondary={isNotFormatFile ? '' : fData(size)}
                    secondaryTypographyProps={{
                      component: 'span',
                      typography: 'caption',
                    }}
                  />
                </Stack>
                <Stack direction="row" sx={{ flex: 0.5, flexWrap: 'wrap' }}>
                  {allDone((file as ExtendFile).id, (file as ExtendFile).video_id as string) ? (
                    <UploadProgressBar
                      sx={{ flex: 0.5, pb: 1 }}
                      title="Concluído"
                      percent={100}
                      icon="line-md:circle-to-confirm-circle-transition"
                      color={theme.palette.success.main}
                    />
                  ) : (
                    <>
                      {renderProgress({
                        progress: uploadProgress,
                        id: (file as ExtendFile).id,
                        context: 'upload',
                        title: 'Upload',
                        icon: 'line-md:cloud-upload-loop',
                        restIcon: 'ic:round-cloud-upload',
                        color: theme.palette.info.main,
                      })}

                      {renderProgress({
                        progress: uploadProgress,
                        id: (file as ExtendFile).video_id,
                        context: 'encode_download',
                        title: 'Encode download',
                        icon: 'line-md:downloading-loop',
                        restIcon: 'ic:round-downloading',
                        color: theme.palette.warning.main,
                        hidden: hideEncodeProgress,
                      })}

                      {renderProgress({
                        progress: uploadProgress,
                        id: (file as ExtendFile).video_id,
                        context: 'encode',
                        title: 'Encoding',
                        icon: 'line-md:speedometer-loop',
                        restIcon: 'line-md:speedometer',
                        color: theme.palette.warning.main,
                        hidden: hideEncodeProgress,
                      })}

                      {renderProgress({
                        progress: uploadProgress,
                        id: (file as ExtendFile).video_id,
                        context: 'encode_upload',
                        title: 'Encode upload',
                        icon: 'line-md:uploading-loop',
                        restIcon: 'hugeicons:upload-circle-01',
                        color: theme.palette.info.main,
                        hidden: hideEncodeProgress,
                      })}
                    </>
                  )}
                </Stack>

                {onRemove &&
                  (uploadProgress?.upload?.[(file as ExtendFile).id]?.progress ?? 0) < 100 && (
                    <IconButton
                      size="small"
                      onClick={() => onRemove(file as CustomFile)}
                      data-cy={`remove-live-${key}`}
                    >
                      <Iconify icon="mingcute:close-line" width={16} />
                    </IconButton>
                  )}
              </Stack>
            </Stack>
          </Scrollbar>
        );
      })}
    </AnimatePresence>
  );
}
