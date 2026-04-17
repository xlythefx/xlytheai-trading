export const API_URL = "http://localhost/trading-api/public/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: number;
  uni_id: string;
  name: string;
  email: string;
  referral_code?: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors && Object.values(data.errors).flat().join(" ")) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload: {
  name: string;
  email: string;
  password: string;
  referral_code?: string;
}) {
  return apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return apiFetch<{ message: string }>("/logout", { method: "POST" }).finally(
    clearAuth,
  );
}

export interface BinancePosition {
  id: number;
  api_key: string;
  symbol: string;
  position_amt: string;
  entry_price: string;
  mark_price?: string;
  unrealized_profit?: string;
  leverage?: string;
  update_time?: number;
}

export interface BinancePastPosition {
  id: number;
  api_key: string;
  symbol: string;
  side: number;
  /** Prefer API `position_amt`; `qty` kept for older responses */
  qty?: string;
  position_amt?: string;
  position_side?: string;
  entry_price: string;
  exit_price?: string;
  realized_pnl?: string;
  order_id?: string;
  closed_at?: string;
  strategy?: string;
}

export interface BinanceAccountData {
  api_key: string;
  uni_id: string;
  secret_key: string;
  name: string;
  balance: string;
  initial_deposit: string;
  currency_type: string;
  demo: number;
  enabled: number;
  created_at: string;
  deleted_at: string | null;
}

export function getBrokerAccounts() {
  return apiFetch<{ data: BinanceAccountData[] }>("/binance/accounts");
}

export function addBrokerAccount(payload: {
  api_key: string;
  secret_key: string;
  name: string;
  demo: boolean;
}) {
  return apiFetch<{ message: string; data: BinanceAccountData }>("/binance/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteBrokerAccount(apiKey: string) {
  return apiFetch<{ message: string }>(`/binance/accounts/${encodeURIComponent(apiKey)}`, {
    method: "DELETE",
  });
}

export function getPositions() {
  return apiFetch<{ data: BinancePosition[] }>("/binance/positions");
}

export function getPastPositions() {
  return apiFetch<{ data: BinancePastPosition[] }>("/binance/past-positions");
}

export interface PastPositionDailyPnl {
  date: string;
  total_pnl: string;
  trade_count: number;
}

export function getPastPositionsDailyPnl(params: { year: number; month: number }) {
  const qs = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
  });
  return apiFetch<{ data: PastPositionDailyPnl[] }>(
    `/binance/past-positions/daily-pnl?${qs.toString()}`,
  );
}

export interface Asset {
  id: number;
  ticker: string;
  type: string;
  broker: string;
  max_increments: number;
  base_size: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export function getAssets(params?: { search?: string; type?: string }) {
  const qs = params ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString() : "";
  return apiFetch<{ success: boolean; assets: Asset[] }>(`/admin/assets${qs}`);
}

export function updateProfile(payload: { name: string; email: string }) {
  return apiFetch<{ message: string; user: AuthUser }>("/user/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return apiFetch<{ message: string }>("/user/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------- Public (no-auth) endpoints ----------

export interface PublicSignal {
  id: number;
  strategy: string | null;
  symbol: string;
  event_type: string; // OPEN | CLOSE | INCREMENT | DECREMENT
  position_side: string | null;
  entry_price: string | null;
  exit_price: string | null;
  position_amt: string | null;
  realized_pnl: string | null;
  pnl_pct: string | null;
  leverage: string | null;
  note: string | null;
  signal_time: string;
  created_at: string;
}

export interface EquityPoint {
  t: string | null;
  equity: number;
  pnl: number;
  symbol: string | null;
}

export interface EquityResponse {
  account: {
    api_key: string;
    name: string;
    currency_type: string;
    balance: string;
    initial_deposit: string;
  } | null;
  data: EquityPoint[];
}

export interface StrategyListing {
  id: number;
  name: string;
  author: string;
  description: string;
  tags: string[];
  win_rate: number;
  total_trades: number;
  roi: number;
  subscribers: number;
  price: number;
  risk: "low" | "medium" | "high";
  color: string;
}

export function getPublicSignals(limit = 50) {
  return apiFetch<{ data: PublicSignal[] }>(`/public/signals?limit=${limit}`);
}

export function getPublicEquity() {
  return apiFetch<EquityResponse>("/public/equity");
}

export function getPublicStrategies() {
  return apiFetch<{ data: StrategyListing[] }>("/public/strategies");
}

// ---------- Affiliate Verification ----------

export interface AffiliateVerification {
  id: number;
  uni_id: string;
  exchange: "binance" | "mexc" | "bybit";
  exchange_uid: string;
  screenshot_path: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; uni_id: string; name: string; email: string };
}

export interface AffiliateVerificationStatus {
  data: AffiliateVerification[];
  has_approved: boolean;
}

export async function submitAffiliateVerification(payload: {
  exchange: string;
  exchange_uid: string;
  screenshot: File;
}) {
  const token = getToken();
  const formData = new FormData();
  formData.append("exchange", payload.exchange);
  formData.append("exchange_uid", payload.exchange_uid);
  formData.append("screenshot", payload.screenshot);

  const res = await fetch(`${API_URL}/affiliate-verification`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors && Object.values(data.errors).flat().join(" ")) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: AffiliateVerification };
}

export function getAffiliateVerificationStatus() {
  return apiFetch<AffiliateVerificationStatus>("/affiliate-verification");
}

export function getAdminAffiliateVerifications(params?: {
  status?: string;
  search?: string;
  page?: number;
}) {
  const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== "");
  const qs = entries.length ? "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : "";
  return apiFetch<{
    data: AffiliateVerification[];
    current_page: number;
    last_page: number;
    total: number;
  }>(`/admin/affiliate-verifications${qs}`);
}

export function updateAdminAffiliateVerification(
  id: number,
  payload: { status: string; admin_notes?: string },
) {
  return apiFetch<{ message: string; data: AffiliateVerification }>(
    `/admin/affiliate-verifications/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}
