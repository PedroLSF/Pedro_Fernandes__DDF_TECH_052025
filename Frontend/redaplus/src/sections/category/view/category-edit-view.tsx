'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { endpoints } from '../../../utils/axios';
import { ICategory } from '../../../types/category';
import useFetchOnce from '../../../hooks/useFetchOnce';
import CategoryNewEditForm from '../category-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function CategoryEditView({ id }: Props) {
  const settings = useSettingsContext();
  const { data: categoryData } = useFetchOnce<ICategory>(endpoints.category.get(id));

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
            name: 'Lista de Categorias',
            href: paths.dashboard.category.root,
          },
          { name: categoryData?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CategoryNewEditForm currentCategory={categoryData} />
    </Container>
  );
}
