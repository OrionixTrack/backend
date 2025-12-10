export const MQTT_TOPICS = {
  TELEMETRY_WILDCARD: 'telemetry/#',
  TELEMETRY_PREFIX: 'telemetry/',
} as const;

export const TRACKER_USERNAME_PATTERN = /^tracker-(\d+)$/;
export const TELEMETRY_TOPIC_PATTERN = /^telemetry\/(\d+)$/;

export const REDIS_KEYS = {
  TRACKER_TRIP: (trackerId: number) => `tracker:${trackerId}:trip`,
  TRACKER_TRIP_PATTERN: 'tracker:*:trip',
} as const;

export const REDIS_TTL_SECONDS = {
  POSITION: 60 * 5,
  TRIP_MAPPING: 60 * 10,
} as const;

export const MQTT_CONFIG = {
  RECONNECT_PERIOD_MS: 5000,
  CONNECT_TIMEOUT_MS: 30000,
  QOS: 2,
  CLIENT_ID: 'orionix-backend-main',
} as const;
