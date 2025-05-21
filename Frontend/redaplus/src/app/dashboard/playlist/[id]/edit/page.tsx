import PlaylistEditView from '../../../../../sections/playlist/view/playlist-edit-view';

export const metadata = {
  title: 'Dashboard: Editar Playlist',
};

type Props = {
  params: {
    id: string;
  };
};

export default function PlaylistEditPage({ params }: Props) {
  const { id } = params;

  return <PlaylistEditView id={id} />;
}
