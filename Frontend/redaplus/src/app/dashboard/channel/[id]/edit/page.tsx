import { ChannelEditView } from 'src/sections/channel/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Editar Canais',
};

type Props = {
  params: {
    id: string;
  };
};

export default function ChannelEditPage({ params }: Props) {
  const { id } = params;

  return <ChannelEditView id={id} />;
}
