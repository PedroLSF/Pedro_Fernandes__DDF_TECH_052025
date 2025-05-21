import { CustomFile } from 'src/components/upload';

import { ICategory } from './category';

// ----------------------------------------------------------------------
export type ICategoryUser = {
  id: string;
  category_id: string;
  user_id: string;
  category: ICategory;
  created_at: Date;
  updated_at?: Date;
};

export type IUserItem = {
  name: string;
  password: string;
  biography: string | null;
  email: string;
  github_link: string | null;
  id: string;
  is_master: boolean;
  phone: string | null;
  status: boolean | null;
  active?: boolean;
  created_at: Date;
  updated_at: Date | null;
  deleted_at?: Date;
};

export type IUsers = {
  results: IUserItem[];
  total: number;
  take: number;
  skip: number;
  totalPages: number;
  currentPage: number;
};

export const USER_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'user-opt-Active' },
  { value: 'false', label: 'Inativo', dataCy: 'user-opt-Inactive' },
];

export const USER_ADMIN_OPTIONS = [
  { value: 'true', label: 'Sim', dataCy: 'user-opt-Active' },
  { value: 'false', label: 'Não', dataCy: 'user-opt-Inactive' },
];

export type IUserTableFilterValue = string | string[] | Date | null;

export type IUserTableFilters = {
  name: string | undefined | any;
  email: undefined | any | string;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
};

// ----------------------------------------------------------------------

export type IUserSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: IUserSocialLink;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IUserProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: Date;
  personLikes: {
    name: string;
    avatarUrl: string;
  }[];
  comments: {
    id: string;
    message: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  }[];
};

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserAccount = {
  email: string;
  isPublic: boolean;
  displayName: string;
  city: string | null;
  state: string | null;
  about: string | null;
  country: string | null;
  address: string | null;
  zipCode: string | null;
  phoneNumber: string | null;
  photoURL: CustomFile | string | null;
};

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type IUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
