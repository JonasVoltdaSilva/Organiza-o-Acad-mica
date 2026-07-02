import AsyncStorage from "@react-native-async-storage/async-storage";

import { defaultSettings } from "../constants";
import { AppData } from "../types";

const STORAGE_KEY = "@hubacad/data/v1";

export function emptyData(): AppData {
  return {
    disciplines: [],
    activities: [],
    exams: [],
    notes: [],
    assessments: [],
    absences: [],
    studySessions: [],
    settings: defaultSettings(),
  };
}

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return { ...emptyData(), ...parsed };
  } catch (err) {
    console.warn("[HubAcad] Falha ao carregar dados locais", err);
    return emptyData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("[HubAcad] Falha ao salvar dados locais", err);
  }
}
