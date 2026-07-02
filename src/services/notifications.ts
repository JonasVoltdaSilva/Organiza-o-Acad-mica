import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/** expo-notifications não é suportado na web — tudo vira no-op lá. */
const isWeb = Platform.OS === "web";

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function setupNotificationChannel(): Promise<void> {
  if (isWeb || Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("prazos", {
    name: "Prazos e provas",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#DBE64C",
  });
}

function reminderBody(minutesBefore: number): string {
  const DAY = 24 * 60;
  if (minutesBefore >= DAY) {
    const days = Math.round(minutesBefore / DAY);
    return days === 1 ? "Falta 1 dia" : `Faltam ${days} dias`;
  }
  if (minutesBefore >= 60) {
    const hours = Math.round(minutesBefore / 60);
    return hours === 1 ? "Falta 1 hora" : `Faltam ${hours} horas`;
  }
  return `Faltam ${minutesBefore} minutos`;
}

interface ScheduleParams {
  title: string;
  subtitle: string;
  targetISO: string;
  reminders: number[];
  groupId: string;
}

/**
 * Agenda um lembrete para cada antecedência escolhida pelo usuário.
 * Retorna os ids agendados para que possam ser cancelados depois.
 */
export async function scheduleReminders({
  title,
  subtitle,
  targetISO,
  reminders,
  groupId,
}: ScheduleParams): Promise<string[]> {
  if (isWeb) return [];
  const granted = await ensureNotificationPermission();
  if (!granted) return [];

  const target = new Date(targetISO).getTime();
  const ids: string[] = [];

  for (const minutesBefore of reminders) {
    const fireAt = new Date(target - minutesBefore * 60 * 1000);
    if (fireAt.getTime() <= Date.now()) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: `${subtitle} · ${reminderBody(minutesBefore)}`,
        sound: true,
        data: { groupId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        ...(Platform.OS === "android" ? { channelId: "prazos" } : {}),
      },
    });
    ids.push(id);
  }

  return ids;
}

/**
 * Lembrete persistente: enquanto a atividade não for concluída,
 * um aviso diário é agendado após o vencimento.
 */
export async function scheduleOverdueReminder(
  title: string,
  groupId: string,
): Promise<string | null> {
  if (isWeb) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Atividade pendente",
      body: `${title} ainda não foi concluída.`,
      sound: true,
      data: { groupId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 24 * 60 * 60,
      repeats: true,
      ...(Platform.OS === "android" ? { channelId: "prazos" } : {}),
    },
  });
}

export async function cancelReminders(ids: string[]): Promise<void> {
  if (isWeb) return;
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}
