import { RoleEditView } from 'src/sections/role/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Editar Função',
};

type Props = {
  params: {
    id: string;
  };
};

export default function RoleEditPage({ params }: Props) {
  const { id } = params;

  return <RoleEditView id={id} />;
}
