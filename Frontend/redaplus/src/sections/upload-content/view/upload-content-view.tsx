'use client';

import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import { Box, Card, Stack, Container, Typography, CardContent, CardActions } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { getCategoryId } from 'src/utils/getCategoryId';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';

import { video_types } from 'src/types/video';
import { ICategory } from 'src/types/category';
import { FileWithMetadataId } from 'src/types/file';

import { putIdOnFile } from '../../../utils/file';
import { fileListener } from '../../../utils/upload';
import { useSweetAlert } from '../../../utils/sweet-alert';
import useUploadController from '../../../hooks/useUploadController';

export default function UploadContentView() {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();

  const { errorAlert } = useSweetAlert();

  const { enqueueSnackbar } = useSnackbar();
  const [category, setCategory] = useState<ICategory[] | ICategory | null>(null);
  const [channel, setChannel] = useState<string[]>([]);

  const [data, setData] = useState<Array<ICategory> | null>(null);
  const {
    isUploading,
    handleStartUploadQueue,
    setFilesWithId,
    uploadProgress,
    filesWithId,
    abortedFiles,
    removeFileWithId,
  } = useUploadController({
    allowedPathname: window.location.pathname,
    fileListener: fileListener({
      searchParams,
      params: {
        category_id: getCategoryId(category),
        channel_id: channel,
      },
      onSuccess: (file: FileWithMetadataId) => {
        enqueueSnackbar({
          message: `${file.name} carregado!`,
          variant: 'info',
        });
      },
      onError: (error) => {
        void errorAlert({
          title: error.message || 'Houve um erro ao subir um vídeo!',
        });

        enqueueSnackbar({
          message: error.message || 'Houve um erro ao subir um vídeo',
          variant: 'error',
        });
      },
    }),
  });

  const handleDirectory = useCallback(
    async () => {
      try {
        const allPaths: string[] = [];

        if (
          filesWithId.length > 0 &&
          (searchParams.get('human_type') === 'raw' || searchParams.has('directories'))
        ) {
          filesWithId.forEach((file) => {
            if (file.path?.startsWith('/')) {
              allPaths.push(file.path);
            }
          });
        }

        const responseDir = await axiosInstance.post('', {
          dirBaseId: searchParams.get('category_id') ?? getCategoryId(category),
          paths: allPaths ?? [],
        });

        setData(responseDir.data);
        return responseDir.data;
      } catch (error) {
        enqueueSnackbar('Erro ao criar diretório(s)', { variant: 'error' });
        if (error.message) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
        return error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filesWithId, setFilesWithId]
  );

  useEffect(() => {
    if (data && Array.isArray(data)) {
      handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleDrop = useCallback(
    (files: File[]) => {
      if (!category && !searchParams.has('replace_id')) {
        enqueueSnackbar({
          message: 'Selecione uma categoria!',
          variant: 'error',
        });
        return;
      }

      if (searchParams.has('upload_limit')) {
        const limit = Number(searchParams.get('upload_limit'));
        if (Number.isNaN(limit)) {
          return;
        }
        if (files.length > limit) {
          enqueueSnackbar({
            message: `Só é permitido ${limit} arquivo(s) no momento!`,
            variant: 'error',
          });
          return;
        }
      }

      const newFiles: FileWithMetadataId[] = [];
      files.forEach((file: File) => {
        const fileWithId: FileWithMetadataId = putIdOnFile(file);
        fileWithId.preview = null;
        if (filesWithId.find(({ id }) => id === fileWithId.id)) {
          return;
        }
        newFiles.push(fileWithId);
      });
      setFilesWithId((old) =>
        [...old, ...newFiles.filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)]
          .filter((f) => f.type.startsWith('video/'))
          .toSorted((a, b) => a.size - b.size)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, filesWithId, setFilesWithId]
  );

  const canShowUploadButton = () => {
    if (searchParams.has('replace_id')) {
      return true;
    }
    if (!category) {
      return false;
    }
    if (!isUploading && filesWithId.length === 0) {
      return true;
    }
    return (
      !isUploading &&
      filesWithId.length > 0 &&
      filesWithId.filter(({ id }) => (uploadProgress?.upload?.[id]?.progress ?? 99) < 100).length >
        0
    );
  };

  const handleUpload = () => {
    if (!canShowUploadButton()) {
      return;
    }
    handleStartUploadQueue();
  };

  const handleRemoveFile = (file: FileWithMetadataId) => {
    if (file.id) {
      removeFileWithId(file.id);
    }
  };

  const handleRemoveAllFiles = () => {
    filesWithId.forEach((file) => {
      removeFileWithId(file.id);
    });
  };

  window.onbeforeunload = (event) => {
    if (isUploading) {
      event.preventDefault();
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        {searchParams.has('human_type') && searchParams.get('human_type') === 'edited' ? (
          <Typography variant="h4">Upload de Conteúdos</Typography>
        ) : (
          <Typography variant="h4">Upload de Vídeos Brutos</Typography>
        )}
        {searchParams.has('replace_title') && (
          <Typography variant="h5">Trocando vídeo: {searchParams.get('replace_title')}</Typography>
        )}
      </Stack>
      <Card sx={{ p: 2.5 }}>
        {/* Not Remove */}

        <CardContent>
          <Upload
            multiple
            uploadProgress={uploadProgress}
            abortedFiles={abortedFiles}
            files={filesWithId}
            onDrop={handleDrop}
            disabled={!canShowUploadButton()}
            onRemove={(file) => handleRemoveFile(file as FileWithMetadataId)}
            accept={{ 'video/*': video_types }}
            hideEncodeProgress={(searchParams.get('human_type') ?? 'raw') === 'raw'}
          />
        </CardContent>

        <CardActions>
          <Typography variant="body2">Total de Vídeos: {filesWithId.length}</Typography>
        </CardActions>

        <CardActions>
          <Button
            data-cy="upload-video-button"
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={async () => {
              if (searchParams.get('human_type') === 'raw' || searchParams.has('directories')) {
                await handleDirectory();
              }
              if (searchParams.get('human_type') === 'edited') {
                handleUpload();
              }
            }}
            disabled={!canShowUploadButton()}
          >
            Upload
          </Button>

          {!!filesWithId.length && (
            <Button
              data-cy="delete-video-button"
              variant="outlined"
              color="inherit"
              onClick={handleRemoveAllFiles}
            >
              remover tudo
            </Button>
          )}
        </CardActions>
      </Card>
    </Container>
  );
}
