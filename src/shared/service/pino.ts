import { pino, type Logger } from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger: Logger = pino({
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }
    : {}),
  level: process.env.PINO_LOG_LEVEL || 'info',

  redact: [], // prevent logging of sensitive data
});
