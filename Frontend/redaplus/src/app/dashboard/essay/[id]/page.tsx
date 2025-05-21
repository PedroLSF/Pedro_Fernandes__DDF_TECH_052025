// ----------------------------------------------------------------------

import EssayEditView from 'src/sections/essay/view/essay-edit-view';

export const metadata = {
  title: 'Dashboard: Editar Redação',
};

type Props = {
  params: {
    id: string;
  };
};

export default function EssayEditPage({ params }: Props) {
  const { id } = params;

  return <EssayEditView id={id} />;
}
