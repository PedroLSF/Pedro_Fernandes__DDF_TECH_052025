import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import useFetchOnce from 'src/hooks/useFetchOnce';

import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from 'src/utils/message';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { IRole, IPermission, ROLE_STATUS_OPTIONS } from 'src/types/role';

import axiosInstance, { endpoints } from '../../utils/axios';

// ----------------------------------------------------------------------

type Props = {
  currentRole?: IRole;
};

export default function RoleNewEditForm({ currentRole }: Props) {
  const router = useRouter();
  const { id } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const { data: permissionData } = useFetchOnce<IPermission[]>(
    `${endpoints.role}/get-all-permissions`
  );

  const NewRoleSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    description: Yup.string().nullable(),
    active: Yup.boolean().required('Situação é obrigatório'),
    is_admin: Yup.boolean().required('Verificação de admin é obrigatório'),
    permission_slug: Yup.array().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentRole?.name || '',
      description: currentRole?.description ?? '',
      active: currentRole?.active || true,
      is_admin: currentRole?.is_admin || false,
      permission_slug:
        currentRole?.rolePermissions?.map((rolePermissions) => rolePermissions?.permission_slug) ||
        [],
    }),
    [currentRole]
  );

  const methods = useForm({
    resolver: yupResolver(NewRoleSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    if (currentRole) {
      setValue('name', currentRole.name);
      setValue('description', currentRole.description ?? '');
      setValue('active', currentRole.active);
      setValue('is_admin', currentRole.is_admin);
      setPermissionSlug(defaultValues?.permission_slug);
    }
  }, [setValue, currentRole, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.permission_slug = permissionSlug;

      if (id) {
        await axiosInstance.put(`${endpoints.role}/${id}`, data);
      }

      if (!id) {
        await axiosInstance.post(endpoints.role, data);
      }

      reset();
      enqueueSnackbar(id ? successUpdateText('Função', false) : successCreateText('função', false));
      router.push(paths.dashboard.role.root);
      console.info(id ? 'update role' : 'new role', data);
    } catch (error) {
      enqueueSnackbar(id ? failUpdateText('função', false) : failCreateText('função', false), {
        variant: 'error',
      });
      console.error(error);
    }
  });

  const [currentTab, setCurrentTab] = useState('role');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Tab value="role" label="Funções" data-cy="role-tab-function" />
      <Tab value="permission" label="Adicionar Permissão" data-cy="role-tab-permission" />
    </Tabs>
  );

  const renderRoleDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ p: 3 }}>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField name="name" label="Nome da função" data-cy="role-name" />

          <RHFSelect name="active" label="Situação" data-cy="role-active">
            {ROLE_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                {status.label}
              </MenuItem>
            ))}
          </RHFSelect>
        </Box>
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
          }}
          marginTop={2}
        >
          <RHFTextField
            name="description"
            label="Descrição da função"
            multiline
            rows={4}
            data-cy="role-description"
          />
        </Box>

        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <RHFSwitch
            name="is_admin"
            label="Admin"
            color="success"
            checked={watch('is_admin')}
            data-cy="role-admin"
          />
        </Box>
      </Card>
    </Grid>
  );

  const ChoosedPermission = useCallback(
    (group_label: string) => {
      const filteredPermissions = permissionData?.filter(
        (permission) => permission.group_label === group_label
      );
      return filteredPermissions?.map((permission) => ({
        label: permission?.name,
        value: permission?.slug,
        dataCy: `${permission?.group_label}-${permission?.slug}`,
      }));
    },
    [permissionData]
  );

  const [permissionSlug, setPermissionSlug] = useState(defaultValues?.permission_slug);

  const permissionMap = Object.fromEntries(
    permissionSlug.map((permissionSlugItem) => [permissionSlugItem, true])
  );

  const handleCheckboxChange = (permission: any) => {
    setPermissionSlug((prev) =>
      prev.includes(permission.value)
        ? prev.filter((val) => val !== permission.value)
        : [...prev, permission.value]
    );
  };

  const renderPermissions = (
    <Card
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="subtitle2">Vídeos Brutos</Typography>

          {ChoosedPermission('raw-videos') &&
            ChoosedPermission('raw-videos')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>

        <Box>
          <Typography variant="subtitle2">Conteudo</Typography>
          {ChoosedPermission('content') &&
            ChoosedPermission('content')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>

        <Box>
          <Typography variant="subtitle2">Legenda</Typography>
          {ChoosedPermission('subtitle') &&
            ChoosedPermission('subtitle')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>

        <Box>
          <Typography variant="subtitle2">Canal</Typography>
          {ChoosedPermission('channel') &&
            ChoosedPermission('channel')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
      </Box>

      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="subtitle2">Categoria</Typography>
          {ChoosedPermission('category') &&
            ChoosedPermission('category')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>

        <Box>
          <Typography variant="subtitle2">Tag</Typography>
          {ChoosedPermission('tag') &&
            ChoosedPermission('tag')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>

        <Box>
          <Typography variant="subtitle2">Função</Typography>
          {ChoosedPermission('role') &&
            ChoosedPermission('role')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>

        <Box>
          <Typography variant="subtitle2">Usuário</Typography>
          {ChoosedPermission('user') &&
            ChoosedPermission('user')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
      </Box>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="subtitle2">Playlist</Typography>
          {ChoosedPermission('playlist') &&
            ChoosedPermission('playlist')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
      </Box>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="subtitle2">Logs</Typography>
          {ChoosedPermission('logs') &&
            ChoosedPermission('logs')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
        <Box>
          <Typography variant="subtitle2">Minha Fila</Typography>
          {ChoosedPermission('list') &&
            ChoosedPermission('list')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
        <Box>
          <Typography variant="subtitle2">Estatísticas</Typography>
          {ChoosedPermission('statistics') &&
            ChoosedPermission('statistics')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
        <Box>
          <Typography variant="subtitle2">Tráfego</Typography>
          {ChoosedPermission('traffic') &&
            ChoosedPermission('traffic')?.map((permission) => (
              <TableRow key={permission.value}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={permissionMap[permission.value]}
                    onChange={() => handleCheckboxChange(permission)}
                    data-cy={permission.dataCy}
                  />
                </TableCell>
                <TableCell>{permission.label}</TableCell>
              </TableRow>
            ))}
        </Box>
      </Box>
    </Card>
  );

  const renderActions = (
    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
      <LoadingButton type="submit" variant="contained" loading={isSubmitting} data-cy="role-button">
        {!currentRole ? 'Criar Função' : 'Salvar'}
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderTabs}
        {currentTab === 'role' && renderRoleDetails}
      </Grid>
      {currentTab === 'permission' && renderPermissions}
      {renderActions}
    </FormProvider>
  );
}
