'use client';

import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import { Card, Stack, Container, Typography, CardContent, CardActions } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { getCategoryId } from 'src/utils/getCategoryId';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSettingsContext } from 'src/components/settings';

import { ICategory } from 'src/types/category';
import { archive_types } from 'src/types/archive';
import { FileWithMetadataId } from 'src/types/file';

import { putIdOnFile } from '../../../utils/file';
import { useSweetAlert } from '../../../utils/sweet-alert';
import { fileArchiveListener } from '../../../utils/upload-file';
import useUploadController from '../../../hooks/useUploadController';
import CategorySelector from '../../../components/category-selector';

export default function UploadArchiveView() {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();

  const { errorAlert } = useSweetAlert();

  const { enqueueSnackbar } = useSnackbar();
  const [category, setCategory] = useState<ICategory[] | ICategory | null>(null);
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
    fileArchiveListener: fileArchiveListener({
      searchParams,
      params: { category_id: getCategoryId(category) },
      onSuccess: (file: FileWithMetadataId) => {
        enqueueSnackbar({
          message: `${file.name} carregado!`,
          variant: 'info',
        });
      },
      onError: (error) => {
        enqueueSnackbar({
          message: 'Houve um erro ao subir um arquivo',
          variant: 'error',
        });
        void errorAlert({
          title: 'Houve um erro ao subir um arquivo.!',
        });
        if (error.message) {
          enqueueSnackbar({
            message: error.message,
            variant: 'error',
          });
        }
      },
    }),
  });

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
        fileWithId.preview = null; // URL.createObjectURL(file),
        if (filesWithId.find(({ id }) => id === fileWithId.id)) {
          return;
        }
        newFiles.push(fileWithId);
      });
      setFilesWithId((old) =>
        [
          ...old,
          ...newFiles.filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i),
        ].toSorted((a, b) => a.size - b.size)
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
        <Typography variant="h4">Upload de arquivos</Typography>
      </Stack>
      <Card sx={{ p: 2.5 }}>
        <CategorySelector
          disabled={isUploading || searchParams.has('directories')}
          label="Diretório"
          onChange={(value) => setCategory(value)}
          categoryId={searchParams.get('category_id') ?? undefined}
          directories={searchParams.has('directories')}
          restrict_primaries
        />

        <CardContent>
          <Upload
            multiple
            uploadProgress={uploadProgress}
            abortedFiles={abortedFiles}
            files={filesWithId}
            onDrop={handleDrop}
            disabled={!canShowUploadButton()}
            onRemove={(file) => handleRemoveFile(file as FileWithMetadataId)}
            accept={{ archive_types, 'application/x-premiere-project': ['.prproj'] }}
            hideEncodeProgress
          />
        </CardContent>

        <CardActions>
          <Typography variant="body2">Total de Arquivos: {filesWithId.length}</Typography>
        </CardActions>

        <CardActions>
          <Button
            data-cy="upload-archive-button"
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={handleUpload}
            disabled={!canShowUploadButton()}
          >
            Upload
          </Button>

          {!!filesWithId.length && (
            <Button
              data-cy="delete-archive-button"
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
