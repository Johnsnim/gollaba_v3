import { atom } from "recoil";

interface UserInfo {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  [key: string]: any;
}

export const userInfoState = atom<UserInfo | null>({
  key: "userInfoState",
  default: null, // 초기값을 null로 설정
});

export const isTokenState = atom<boolean>({
  key: "isTokenState",
  default: false,
});
