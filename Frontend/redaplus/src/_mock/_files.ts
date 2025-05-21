import { _mock } from './_mock';
import { _tags } from './assets';

// ----------------------------------------------------------------------

const GB = 1000000000 * 24;

const FILES = [
  'expertise-2015-conakry-sao-tome.mp4',
  'trinidad-samuel-morse-bring.m4v',
  'trinidad-samuel-morse-bring2.m4v',
];

const URLS = [
  'https://www.cloud.com/s/c218bo6kjuqyv66/expertise_2015_conakry_sao-tome-and-principe_gender.mp4',
  'https://www.cloud.com/s/c218bo6kjuqyv66/trinidad_samuel-morse_bring.m4v',
  'https://www.cloud.com/s/c218bo6kjuqyv66/trinidad_samuel-morse_bring.m4v',
];

const status = ['distribuido', 'editado', 'aprovado'];

const rawStatus = ['active', 'inactive', 'active'];

const SHARED_PERSONS = [...Array(20)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatarUrl: _mock.image.avatar(index),
  permission: index % 2 ? 'view' : 'edit',
}));

export const FILE_TYPE_OPTIONS = ['image', 'video'];

// ----------------------------------------------------------------------

const shared = (index: number) =>
  (index === 0 && SHARED_PERSONS.slice(0, 5)) ||
  (index === 1 && SHARED_PERSONS.slice(5, 9)) ||
  (index === 2 && SHARED_PERSONS.slice(9, 11)) ||
  (index === 3 && SHARED_PERSONS.slice(11, 12)) ||
  [];

export const _files = FILES.map((name, index) => ({
  id: `${_mock.id(index)}_file`,
  name,
  url: URLS[index],
  shared: shared(index),
  tags: _tags.slice(0, 5),
  size: GB / ((index + 1) * 500),
  status: status[index],
  active: index > 1,
  createdAt: _mock.time(index),
  modifiedAt: _mock.time(index),
  category: 'categoria 1',
  type: `${name.split('.').pop()}`,
  isFavorited: _mock.boolean(index + 1),
  thumbnail: _mock.image.cover(index + 3),
  duration: `10:3${index}`,
}));

export const _rawFiles = FILES.map((name, index) => ({
  id: `${_mock.id(index)}_file`,
  name,
  url: URLS[index],
  shared: shared(index),
  tags: _tags.slice(0, 5),
  size: GB / ((index + 1) * 500),
  status: rawStatus[index],
  createdAt: _mock.time(index),
  modifiedAt: _mock.time(index),
  type: `${name.split('.').pop()}`,
  isFavorited: _mock.boolean(index + 1),
  thumbnail: _mock.image.cover(index + 3),
  duration: `10:3${index}`,
}));

export const _allFiles = [..._files];
