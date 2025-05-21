import ChannelProfileView from 'src/sections/channel/view/channel-profile-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Página do canal',
};

type Props = {
  params: {
    id: string;
  };
};

export default function ChannelProfilePage({ params }: Props) {
  const { id } = params;

  return <ChannelProfileView id={id} />;
}
