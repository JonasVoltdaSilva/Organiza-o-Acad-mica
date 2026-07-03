import { SUAP_BASE_URL } from "../config/integrations";

const API_BASE = `${SUAP_BASE_URL}/api/v2`;

export class SuapAuthError extends Error {}

export interface SuapLoginResult {
  token: string;
}

/**
 * Login direto por matrícula/senha (diferente do Moodle: o SUAP não usa
 * redirecionamento via navegador, é um POST simples que devolve um token).
 */
export async function loginSuap(
  matricula: string,
  senha: string,
): Promise<SuapLoginResult> {
  const response = await fetch(`${API_BASE}/autenticacao/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: matricula, password: senha }),
  });
  if (!response.ok) {
    throw new SuapAuthError("Matrícula ou senha do SUAP inválidas.");
  }
  const data = await response.json();
  if (!data || typeof data !== "object" || !("token" in data)) {
    throw new SuapAuthError("Resposta inesperada do SUAP.");
  }
  return { token: String((data as { token: unknown }).token) };
}

async function callSuap<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!response.ok) {
    throw new SuapAuthError("Falha ao consultar o SUAP.");
  }
  return response.json() as Promise<T>;
}

export interface SuapMeusDados {
  matricula: string;
  nome_usual?: string;
  nome?: string;
}

export async function fetchSuapMeusDados(
  token: string,
): Promise<SuapMeusDados> {
  return callSuap<SuapMeusDados>(token, "/minhas-informacoes/meus-dados/");
}

export interface SuapNotaEtapa {
  descricao?: string;
  nota?: number | null;
}

export interface SuapBoletimDisciplina {
  codigo?: string;
  disciplina: string;
  professor?: string;
  carga_horaria?: number;
  /** total de faltas no período (em horas ou aulas, a confirmar) */
  faltas?: number;
  frequencia?: number;
  situacao?: string;
  notas?: SuapNotaEtapa[];
}

export async function fetchSuapBoletim(
  token: string,
  ano: number,
  periodo: number,
): Promise<SuapBoletimDisciplina[]> {
  return callSuap<SuapBoletimDisciplina[]>(
    token,
    `/minhas-informacoes/boletim/${ano}/${periodo}/`,
  );
}

export interface SuapHorarioSlot {
  /** convenção do SUAP pode divergir de 0=domingo..6=sábado — confirmar e remapear aqui se necessário */
  dia_semana: number;
  horario_inicio?: string;
  horario_fim?: string;
  disciplina: string;
  sala?: string;
}

/**
 * Path ainda não confirmado contra suap.ufr.edu.br — isolado nesta função
 * para que um ajuste futuro não precise mexer em AppProvider.tsx.
 */
export async function fetchSuapHorario(
  token: string,
  ano: number,
  periodo: number,
): Promise<SuapHorarioSlot[]> {
  return callSuap<SuapHorarioSlot[]>(
    token,
    `/minhas-informacoes/horarios/${ano}/${periodo}/`,
  );
}
