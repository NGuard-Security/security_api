import { type APIUser } from 'discord-api-types/v10';

export class discordUserDto
  implements
    Omit<APIUser, 'username' | 'discriminator' | 'global_name' | 'avatar'>
{
  /**
   * 유저의 Discord ID
   * @example 80351110224678912
   */
  id: string;

  /**
   * 유저의 Discord 유저 아이디
   * @example nelly
   */
  userName: string;

  /**
   * 유저의 Discord 닉네임
   * @example Nelly
   */
  nickName: string;

  /**
   * 유저의 Discord 프로필 사진 ID
   * @example https://cdn.discordapp.com/avatars/80351110224678912/8342729096ea3675442027381ff50dfe.webp
   * @description URL Scheme: https://cdn.discordapp.com/avatars/{USER_ID}/{USER_AVATAR}.(png|jpg|webp|gif)
   */
  icon: string;

  /**
   * 유저의 배너 색상
   * @example 16711680
   */
  accent_color?: number;

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
   * 유저 블랙리스트 여부
   * @example false
   */
  isBlacklist: boolean;
}

export default discordUserDto;
