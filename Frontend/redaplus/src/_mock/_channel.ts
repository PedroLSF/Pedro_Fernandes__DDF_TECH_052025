// ----------------------------------------------------------------------

export enum ChannelEditTabs {
  Group = 'group',
  IntroEnding = 'intro/ending',
}

export const CHANNEL_TABS = [{ value: 'data', label: 'Dados do Canal', dataCy: 'channel-data' }];
export const CHANNEL_EDIT_TABS = [
  { value: ChannelEditTabs.Group, label: 'Adicionar Videos', dataCy: 'channel-add-videos' },
  {
    value: ChannelEditTabs.IntroEnding,
    label: 'Adicionar Vinheta',
    dataCy: 'channel-add-introduction',
  },
];
