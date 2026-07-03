import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { MOODLE_BASE_URL, MOODLE_PROXY_URL } from "../config/integrations";

/** Precisa bater com o "scheme" configurado em app.json. */
const CUSTOM_SCHEME = "hubacad";
const SSO_TOKEN_PREFIX = `${CUSTOM_SCHEME}://token=`;

/**
 * CORS só existe no navegador, então no app nativo (Android/iOS) chamamos o
 * AVA direto, sem o proxy — o que também evita o desafio anti-bot da
 * Cloudflare que bloqueia chamadas servidor-a-servidor feitas pelo Worker.
 */
function restEndpoint(): string {
  return Platform.OS === "web"
    ? `${MOODLE_PROXY_URL}/rest`
    : `${MOODLE_BASE_URL}/webservice/rest/server.php`;
}

export interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
}

export interface MoodleAssignment {
  id: number;
  course: number;
  name: string;
  intro: string;
  /** epoch em segundos; 0 = sem prazo definido */
  duedate: number;
}

export class MoodleAuthError extends Error {}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export interface MoodleSSOResult {
  token: string;
  privateToken: string;
}

/**
 * Login via SSO (obrigatório no AVA da UFR, que autentica através do SUAP).
 * Segue o mesmo protocolo do app oficial da Moodle: abre o site num
 * navegador, o usuário loga no SUAP normalmente, e o Moodle devolve o token
 * através de um link customizado (`hubacad://token=assinatura:::token:::
 * tokenPrivado`). A assinatura é validada com MD5(baseUrl + passport) antes
 * de confiar no token recebido.
 */
export async function loginMoodleViaSSO(): Promise<MoodleSSOResult> {
  const passport = String(Math.floor(Math.random() * 1_000_000));
  const launchUrl =
    `${MOODLE_BASE_URL}/admin/tool/mobile/launch.php?` +
    new URLSearchParams({
      service: "moodle_mobile_app",
      passport,
      urlscheme: CUSTOM_SCHEME,
    }).toString();

  const result = await WebBrowser.openAuthSessionAsync(
    launchUrl,
    `${CUSTOM_SCHEME}://`,
  );

  if (result.type !== "success" || !result.url) {
    throw new MoodleAuthError("Login cancelado.");
  }
  if (!result.url.startsWith(SSO_TOKEN_PREFIX)) {
    throw new MoodleAuthError("Resposta inesperada do AVA.");
  }

  const payload = decodeURIComponent(result.url.slice(SSO_TOKEN_PREFIX.length));
  const [signature, token, privateToken] = payload.split(":::");
  if (!signature || !token) {
    throw new MoodleAuthError("Resposta inesperada do AVA.");
  }

  const expectedSignature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    MOODLE_BASE_URL + passport,
  );
  if (signature !== expectedSignature) {
    throw new MoodleAuthError("Assinatura de login inválida.");
  }

  return { token, privateToken: privateToken ?? "" };
}

async function callMoodleFunction<T>(
  token: string,
  wsfunction: string,
  params: Record<string, string> = {},
): Promise<T> {
  const query = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: "json",
    ...params,
  });
  const response = await fetch(`${restEndpoint()}?${query.toString()}`);
  const data = await response.json();
  if (data && typeof data === "object" && "exception" in data) {
    throw new Error(
      (data as { message?: string }).message || "Falha ao consultar o AVA.",
    );
  }
  return data as T;
}

export interface MoodleSiteInfo {
  userid: number;
  fullname: string;
}

export async function fetchMoodleSiteInfo(
  token: string,
): Promise<MoodleSiteInfo> {
  return callMoodleFunction<MoodleSiteInfo>(
    token,
    "core_webservice_get_site_info",
  );
}

export async function fetchMoodleCourses(
  token: string,
): Promise<MoodleCourse[]> {
  const siteInfo = await fetchMoodleSiteInfo(token);
  return callMoodleFunction<MoodleCourse[]>(
    token,
    "core_enrol_get_users_courses",
    { userid: String(siteInfo.userid) },
  );
}

export async function fetchMoodleAssignments(
  token: string,
  courseIds: number[],
): Promise<MoodleAssignment[]> {
  if (courseIds.length === 0) return [];
  const params: Record<string, string> = {};
  courseIds.forEach((id, index) => {
    params[`courseids[${index}]`] = String(id);
  });
  const data = await callMoodleFunction<{
    courses: { assignments: MoodleAssignment[] }[];
  }>(token, "mod_assign_get_assignments", params);
  return data.courses.flatMap((c) =>
    c.assignments.map((a) => ({ ...a, intro: stripHtml(a.intro || "") })),
  );
}
