import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Chip, MenuItem } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog, { DialogProps } from '@mui/material/Dialog';

import { useAuthContext } from 'src/auth/hooks';

import { putIdOnFile } from '../../utils/file';
import Loading from '../../app/dashboard/loading';
import { successGenericText } from '../../utils/message';
import axiosInstance, { endpoints } from '../../utils/axios';
import { VideoTrackKind, VideoTrackLang } from '../../types/content';
import FormProvider, { RHFSelect, RHFUpload, RHFTextField } from '../../components/hook-form';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  title?: string;
  //
  open: boolean;
  onClose: VoidFunction;
  video_id: string;
  mutate: VoidFunction;
}

const accept = { '*': [] };

export default function ContentNewTrackDialog({
  title = 'Adicionar Legendas',
  open,
  onClose,
  video_id,
  mutate,
  ...other
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const schema = Yup.object().shape({
    video_id: Yup.string().required('Vídeo é obrigatório'),
    kind: Yup.string().oneOf(Object.keys(VideoTrackKind)).required('Tipo é obrigatório'),
    label: Yup.string().required('Label é obrigatório'),
    lang: Yup.string().oneOf(Object.keys(VideoTrackLang)).required('Idioma é obrigatório'),
    is_default: Yup.string().oneOf(['true', 'false']).required('Padrão é obrigatório'),
    video_track_file: Yup.mixed().nullable().required('Arquivo é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      video_id,
      kind: 'subtitles',
      label: '',
      lang: 'pt_br',
      is_default: 'false' as NonNullable<'false' | 'true' | undefined>,
      video_track_file: null as any,
    }),
    [video_id]
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const selectedFile = watch('video_track_file');

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!data.video_track_file) {
        enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
        return;
      }

      const allowedExtensions = ['.srt', '.vtt'];

      if (!allowedExtensions.some((ext) => data.video_track_file.name.includes(ext))) {
        enqueueSnackbar('Arquivo inválido', { variant: 'error' });
        return;
      }

      setLoading(true);
      const fileWithId = putIdOnFile(data.video_track_file);
      const {
        data: { video_track_id, upload_uri },
      } = await axiosInstance.post(endpoints.upload.requestVideoTrackUpload, {
        video_id,
        label: data.label,
        file_id: fileWithId.id,
        file_path: fileWithId.path,
        file_name: fileWithId.name,
        file_size: fileWithId.size,
        file_last_modified: fileWithId.lastModified,
        file_type: fileWithId.type || 'text/plain',
        kind: data.kind,
        lang: data.lang,
        is_default: data.is_default === 'true',
        approved_by: user?.id,
        status: 'none',
      });

      if (!video_track_id || !upload_uri) {
        enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
        setLoading(false);
        return;
      }

      const uploadResponse = await axiosInstance.put(upload_uri, fileWithId, {
        headers: { 'Content-Type': fileWithId.type, Authorization: undefined },
      });

      if (uploadResponse.status !== 200) {
        enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
        setLoading(false);
        return;
      }

      await axiosInstance.post(endpoints.upload.videoTrackUploaded, {
        video_track_id,
        file_id: fileWithId.id,
      });

      setLoading(false);

      onClose();
      enqueueSnackbar(successGenericText());
      mutate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, {
          variant: 'error',
        });
      }
      setLoading(false);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      setValue('video_track_file', file as any, { shouldValidate: true });
    },
    [setValue]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

        <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
            sx={{ pt: 3, pb: 3 }}
          >
            <RHFTextField name="label" label="Titulo *" data-cy="video-track-label" />
            <RHFSelect name="kind" label="Tipo *" data-cy="video-track-kind">
              {Object.keys(VideoTrackKind).map((kind) => (
                <MenuItem data-cy={`video-track-kind-option-${kind}`} key={kind} value={kind}>
                  {VideoTrackKind[kind as keyof typeof VideoTrackKind]}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="lang" label="Idioma *" data-cy="video-track-lang">
              {Object.keys(VideoTrackLang).map((lang) => (
                <MenuItem data-cy={`video-track-lang-option-${lang}`} key={lang} value={lang}>
                  {VideoTrackLang[lang as keyof typeof VideoTrackLang]}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="is_default" label="Padrão *" data-cy="video-track-is_default">
              {[false, true].map((val, i) => (
                <MenuItem
                  key={`${String(val)}${i}`}
                  data-cy={`video-track-is_default-option-${String(val)}`}
                  value={val ? 'true' : 'false'}
                >
                  {val ? 'sim' : 'não'}
                </MenuItem>
              ))}
            </RHFSelect>

            {selectedFile ? (
              <Box>
                <Chip
                  label={(selectedFile as File).name}
                  onDelete={() => setValue('video_track_file', null)}
                />
              </Box>
            ) : (
              <RHFUpload
                name="video_track_file"
                setValue={() => {}}
                accept={accept}
                onDrop={handleDrop}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="video-track-save"
          >
            Salvar
          </LoadingButton>
          <Button data-cy="video-track-cancel" variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
