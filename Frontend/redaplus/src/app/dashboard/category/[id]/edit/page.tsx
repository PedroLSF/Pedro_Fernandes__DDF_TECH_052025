import { CategoryEditView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Unyplay: Editar Categoria',
};

type Props = {
  params: {
    id: string;
  };
};

export default function CategoryEditPage({ params }: Props) {
  const { id } = params;

  return <CategoryEditView id={id} />;
}
