import { atom } from "recoil";

interface UserInfo {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  [key: string]: any;
}

export const userInfoState = atom<UserInfo | null>({
  key: "userInfoState",
  default: null,
});

export const isTokenState = atom<boolean>({
  key: "isTokenState",
  default: false,
});

export const userFavoritesState = atom<string[]>({
  key: "userFavoritesState",
  default: [],
});
