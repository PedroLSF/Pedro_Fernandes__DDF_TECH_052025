import { _userList } from 'src/_mock/_user';

import { TagEditView } from 'src/sections/tag/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Editar Tags',
};

type Props = {
  params: {
    id: string;
  };
};

export default function TagEditPage({ params }: Props) {
  const { id } = params;

  return <TagEditView id={id} />;
}

export async function generateStaticParams() {
  return _userList.map((user) => ({
    id: user.id,
  }));
}
