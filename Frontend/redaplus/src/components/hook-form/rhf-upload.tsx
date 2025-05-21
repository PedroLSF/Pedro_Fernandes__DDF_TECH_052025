import { enqueueSnackbar } from 'notistack';
import { useState, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

import Loading from '../../app/dashboard/loading';
import axiosInstance, { endpoints } from '../../utils/axios';
import { Upload, UploadBox, UploadProps, UploadImage, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------

interface Props extends Omit<UploadProps, 'file'> {
  name: string;
  setValue: (...args: any[]) => void;
  multiple?: boolean;
  accept?: Record<string, string[]>;
}

// ----------------------------------------------------------------------

export function RHFUploadImage({ name, ...other }: Props) {
  const { control } = useFormContext();
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        (file as any).preview = URL.createObjectURL(file);

        setLoading(true);

        try {
          const {
            data: { storage_key, upload_uri },
          } = await axiosInstance.post(endpoints.upload.requestImageUpload, {
            type: file.type,
            name: file.name,
          });

          if (!storage_key || !upload_uri) {
            enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
          }

          const response = await axiosInstance.put(upload_uri, file, {
            headers: { 'Content-Type': file.type, Authorization: undefined },
          });

          if (response.status !== 200) {
            enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
          }

          (file as any).storage_key = storage_key;
        } catch (error) {
          console.error(error);
          enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
          if (error.message) {
            enqueueSnackbar(error.message, {
              variant: 'error',
            });
          }
        }
        setLoading(false);

        other.setValue(name, file, { shouldValidate: true });
      }
    },
    [name, other]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <UploadImage error={!!error} file={field.value} onDrop={handleDrop} {...other} />

          {!!error && (
            <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, ...other }: Props) {
  const { control } = useFormContext();
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        setLoading(true);

        try {
          const {
            data: { storage_key, upload_uri },
          } = await axiosInstance.post(endpoints.upload.requestImageUpload, {
            type: file.type,
            name: file.name,
          });

          if (!storage_key || !upload_uri) {
            enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
          }

          const response = await axiosInstance.put(upload_uri, file, {
            headers: { 'Content-Type': file.type, Authorization: undefined },
          });

          if (response.status !== 200) {
            enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
          }

          (file as any).storage_key = storage_key;

          (file as any).preview = URL.createObjectURL(file);
        } catch (error) {
          console.error(error);
          enqueueSnackbar('Erro ao subir arquivo', { variant: 'error' });
          if (error.message) {
            enqueueSnackbar(error.message, {
              variant: 'error',
            });
          }
          (file as any).preview = '/assets/icons/png/fluent--cloud-error-16-regular.png';
        }
        setLoading(false);

        other.setValue(name, file, { shouldValidate: true });
      }
    },
    [name, other]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <UploadAvatar error={!!error} file={field.value} onDrop={handleDrop} {...other} />

          {!!error && (
            <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUploadBox({ name, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox files={field.value} error={!!error} {...other} />
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
          <Upload
            multiple
            accept={other.accept ?? { 'image/*': [] }}
            files={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        ) : (
          <Upload
            accept={other.accept ?? { 'image/*': [] }}
            file={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        )
      }
    />
  );
}
