import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Sends a push notification to a list of Expo push tokens.
 * Filters out invalid tokens and handles chunking automatically.
 * Returns the list of tickets for further receipt checking if needed.
 */
export async function sendPushNotifications(
  tokens: string[],
  payload: PushPayload
): Promise<ExpoPushTicket[]> {
  const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...chunkTickets);
  }

  return tickets;
}
