import {
  ApplicationIntegrationType,
  OAuth2Scopes,
  type APIUser,
  type APIGuild,
  type APIEntitlement,
} from 'discord-api-types/v10';

export class DiscordEventPayloadDto {
  /**
   * Version scheme for the webhook event. Currently always `1`
   * @example 1
   */
  version: number;

  /**
   * ID of your app
   * @example '937636597040570388'
   */
  application_id: string;

  /**
   * Type of webhook, either `0` for PING or `1` for webhook events
   * @example 0
   */
  type: DiscordWebhookType;

  /**
   * Event data payload
   */
  event?: {
    /**
     * Event type
     * @example 'APPLICATION_AUTHORIZED'
     */
    type: DiscordEventType;

    /**
     * Timestamp of when the event occurred in ISO8601 format
     * @example '2021-08-01T00:00:00.000Z'
     */
    timestamp: string;

    /**
     * Data for the event. The shape depends on the event type
     */
    data: DiscordEventDataForApplicationAuthorized | APIEntitlement;
  };
}

export class DiscordEventDataForApplicationAuthorized {
  /**
   * Installation context for the authorization.
   * Either guild (0) if installed to a server or user (1) if installed to a user's account
   *
   * @example 0
   */
  integration_type?: ApplicationIntegrationType;

  /**
   * User who authorized the app
   */
  user: APIUser;

  /**
   * List of scopes the user authorized
   * @example ['applications.commands', 'bot']
   */
  scopes: OAuth2Scopes[];

  /**
   * Server which app was authorized for (when integration type is 0)
   */
  guild?: APIGuild;
}

export enum DiscordWebhookType {
  PING = 0,
  EVENT = 1,
}

export enum DiscordEventType {
  APPLICATION_AUTHORIZED = 'APPLICATION_AUTHORIZED',
  ENTITLEMENT_CREATE = 'ENTITLEMENT_CREATE',
}

export default DiscordEventPayloadDto;
