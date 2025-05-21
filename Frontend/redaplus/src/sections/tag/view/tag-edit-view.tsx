'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import useFetchOnce from 'src/hooks/useFetchOnce';

import { endpoints } from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ITagItem } from 'src/types/tag';

import TagNewEditForm from '../tag-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function TagEditView({ id }: Props) {
  const settings = useSettingsContext();

  const { data: tagData } = useFetchOnce<{
    results: Array<ITagItem>;
  }>(endpoints.tag, {
    params: {
      take: 10,
      skip: 0,
    },
  });

  const currentTag = tagData?.results.find((tag) => tag.id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Lista de Tag',
            href: paths.dashboard.tag.list,
          },
          { name: currentTag?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TagNewEditForm currentTag={currentTag} />
    </Container>
  );
}
