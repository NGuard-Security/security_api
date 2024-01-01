import { type APIUser } from 'discord-api-types/v10';

export class discordUserDto implements APIUser {
  /**
   * 유저의 Discord ID
   * @example 80351110224678912
   */
  id: string;

  /**
   * 유저의 Discord 닉네임
   * @example Nelly
   */
  username: string;

  /**
   * 유저의 Discord 태그
   * @example 1337
   */
  discriminator: string;

  /**
   * 유저의 Global Discord 닉네임
   * @example Nelly
   */
  global_name: string;

  /**
   * 유저의 Discord 프로필 사진 ID
   * @example 8342729096ea3675442027381ff50dfe
   * @description 전체 URL: https://cdn.discordapp.com/avatars/{USER_ID}/{USER_AVATAR}.(png|jpg|webp|gif)
   */
  avatar: string;

  /**
   * 유저의 봇 여부
   * @example false
   */
  bot?: boolean;

  /**
   * 유저의 시스템 사용자 여부
   * @example false
   */
  system?: boolean;

  /**
   * 유저의 MFA 활성화 여부
   * @example true
   */
  mfa_enabled?: boolean;

  /**
   * 유저의 배너 이미지
   * @example 06c16474723fe537c283b8efa61a30c8
   * @description 전체 URL: https://cdn.discordapp.com/banners/{USER_ID}/{USER_BANNER}.(png|jpg|webp|gif)
   */
  banner?: string;

  /**
   * 유저의 배너 색상
   * @example 16711680
   */
  accent_color?: number;

  /**
   * 유저의 로케일
   * @example en-US
   * @description https://discord.com/developers/docs/reference#locales
   */
  locale?: string;

  /**
   * 유저 인증 여부
   * @example true
   */
  verified?: boolean;

  /**
   * 유저의 이메일
   * @example nelly@discord.com
   */
  email?: string;

  /**
   * 유저의 Flags
   * @example 64
   * @description https://discord.com/developers/docs/resources/user#user-object-user-flags
   */
  flags?: number;

  /**
   * 유저의 Nitro 구독 상태
   * @example 1
   * @description https://discord.com/developers/docs/resources/user#user-object-premium-types
   */
  premium_type?: number;

  /**
   * 유저의 공개 Flags
   * @example 64
   * @description https://discord.com/developers/docs/resources/user#user-object-user-flags
   */
  public_flags?: number;

  /**
   * 유저의 프로필 Decoration ID
   * @example 06c16474723fe537c283b8efa61a30c8
   * @description 전체 URL: https://cdn.discordapp.com/avatar-decorations/{USER_ID}/{USER_AVATAR_DECORATION}.png
   */
  avatar_decoration?: string;
}

export default discordUserDto;
