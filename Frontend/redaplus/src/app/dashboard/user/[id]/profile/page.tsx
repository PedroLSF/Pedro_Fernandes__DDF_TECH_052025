import { _userList } from 'src/_mock/_user';

import { UserProfileView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Perfil de usuário',
};

type Props = {
  params: {
    id: string;
  };
};

export default function UserProfilePage({ params }: Props) {
  const { id } = params;

  return <UserProfileView id={id} />;
}

export async function generateStaticParams() {
  return _userList.map((user) => ({
    id: user.id,
  }));
}
