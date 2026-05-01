//export const API_URL = "http://localhost/trading-api/public/api";
export const API_URL = "https://api.flowehn.com/api";
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

/** Unified account shape used by Portfolio (all exchanges share the same DB schema). */
export type ExchangeAccountData = BinanceAccountData & { exchange: "binance" | "mexc" | "bybit" };

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

export function updateBrokerAccount(apiKey: string, payload: { name?: string; secret_key?: string }) {
  return apiFetch<{ message: string; data: BinanceAccountData }>(`/binance/accounts/${encodeURIComponent(apiKey)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBrokerAccount(apiKey: string) {
  return apiFetch<{ message: string }>(`/binance/accounts/${encodeURIComponent(apiKey)}`, {
    method: "DELETE",
  });
}

// ── MEXC accounts ──────────────────────────────────────────────────────────

export function getMexcAccounts() {
  return apiFetch<{ data: BinanceAccountData[] }>("/mexc/accounts");
}

export function addMexcAccount(payload: {
  api_key: string;
  secret_key: string;
  name: string;
  demo: boolean;
}) {
  return apiFetch<{ message: string; data: BinanceAccountData }>("/mexc/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMexcAccount(apiKey: string, payload: { name?: string; secret_key?: string }) {
  return apiFetch<{ message: string; data: BinanceAccountData }>(`/mexc/accounts/${encodeURIComponent(apiKey)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMexcAccount(apiKey: string) {
  return apiFetch<{ message: string }>(`/mexc/accounts/${encodeURIComponent(apiKey)}`, {
    method: "DELETE",
  });
}

// ── Bybit accounts ─────────────────────────────────────────────────────────

export function getBybitAccounts() {
  return apiFetch<{ data: BinanceAccountData[] }>("/bybit/accounts");
}

export function addBybitAccount(payload: {
  api_key: string;
  secret_key: string;
  name: string;
  demo: boolean;
}) {
  return apiFetch<{ message: string; data: BinanceAccountData }>("/bybit/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBybitAccount(apiKey: string, payload: { name?: string; secret_key?: string }) {
  return apiFetch<{ message: string; data: BinanceAccountData }>(`/bybit/accounts/${encodeURIComponent(apiKey)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBybitAccount(apiKey: string) {
  return apiFetch<{ message: string }>(`/bybit/accounts/${encodeURIComponent(apiKey)}`, {
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

export function getAssets(params?: { search?: string; type?: string; broker?: string }) {
  const qs = params ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString() : "";
  return apiFetch<{ success: boolean; assets: Asset[] }>(`/admin/assets${qs}`);
}

export function updateAssetStatus(id: number, enabled: boolean) {
  return apiFetch<{ success: boolean; message: string; asset: Asset }>(
    `/admin/assets/${id}/status`,
    { method: "PUT", body: JSON.stringify({ enabled }) },
  );
}

export interface AssetPayload {
  ticker: string;
  type: string;
  broker: string;
  max_increments: number;
  base_size: number;
  enabled: boolean;
}

export function createAsset(data: AssetPayload) {
  return apiFetch<{ success: boolean; message: string; asset: Asset }>(
    `/admin/assets`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export function updateAsset(id: number, data: AssetPayload) {
  return apiFetch<{ success: boolean; message: string; asset: Asset }>(
    `/admin/assets/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
  );
}

export function deleteAsset(id: number) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/assets/${id}`,
    { method: "DELETE" },
  );
}

export interface AdminDashboardStats {
  total_funds: string;
  total_realized: string;
  total_unrealized: string;
  users_count: number;
  broker_accounts_connected: number;
  positions_open: number;
  trades_done: number;
  pnl_daily: string;
  pnl_weekly: string;
  pnl_monthly: string;
}

export interface AdminDashboardRecentTrade {
  id: number;
  symbol: string;
  position_side: string;
  realized_pnl: string;
  closed_at: string | null;
  strategy: string | null;
  user_name: string | null;
  account_name: string | null;
}

export function getAdminDashboard() {
  return apiFetch<{
    success: boolean;
    stats: AdminDashboardStats;
    recent_trades: AdminDashboardRecentTrade[];
  }>("/admin/dashboard");
}

export interface AdminEquityPoint {
  date: string;
  value: number;
}

export interface AdminTradeMetrics {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  realized_total: number;
  unrealized_total: number;
}

export interface AdminOpenPositionPreview {
  id: number;
  symbol: string;
  position_side: string;
  position_amt: string;
  entry_price: string;
  mark_price: string;
  unrealized_profit: string;
  update_time: number;
  user_name: string | null;
  account_name: string | null;
}

export function getAdminAnalytics(params?: {
  equity_range?: "7D" | "30D" | "90D" | "All";
  cal_year?: number;
  cal_month?: number;
}) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return apiFetch<{
    success: boolean;
    equity_points: AdminEquityPoint[];
    equity_trade_count: number;
    calendar_pnl: Record<string, string>;
    trade_metrics: AdminTradeMetrics;
    open_positions_preview: AdminOpenPositionPreview[];
  }>(`/admin/analytics${qs}`);
}

export interface AdminClosedPositionRow {
  id: number;
  api_key: string;
  symbol: string;
  position_side: string;
  position_amt: string;
  entry_price: string;
  exit_price: string;
  realized_pnl: string;
  closed_at: string | null;
  strategy: string | null;
  user_name: string | null;
  account_name: string | null;
}

export interface AdminOpenPositionRow {
  id: number;
  api_key: string;
  symbol: string;
  position_side: string;
  position_amt: string;
  entry_price: string;
  mark_price: string;
  unrealized_profit: string;
  notional: string;
  update_time: number;
  user_name: string | null;
  account_name: string | null;
}

export function getAdminPositionsClosed(params?: { page?: number; per_page?: number }) {
  const qs =
    "?" +
    new URLSearchParams({
      page: String(params?.page ?? 1),
      per_page: String(params?.per_page ?? 10),
    }).toString();
  return apiFetch<{
    success: boolean;
    data: AdminClosedPositionRow[];
    total: number;
    current_page: number;
    last_page: number;
  }>(`/admin/positions/closed${qs}`);
}

export function getAdminPositionsOpen(params?: { page?: number; per_page?: number }) {
  const qs =
    "?" +
    new URLSearchParams({
      page: String(params?.page ?? 1),
      per_page: String(params?.per_page ?? 10),
    }).toString();
  return apiFetch<{
    success: boolean;
    data: AdminOpenPositionRow[];
    total: number;
    current_page: number;
    last_page: number;
  }>(`/admin/positions/open${qs}`);
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

// ---------- Admin: Users ----------

export interface AdminUser {
  id: number;
  uni_id: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  referral_code: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  affiliate_status: "pending" | "approved" | "rejected" | null;
  affiliate_exchange: string | null;
}

export function getAdminUsers(params?: {
  search?: string;
  status?: string;
  affiliate_status?: string;
  page?: number;
  per_page?: number;
}) {
  const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== "");
  const qs = entries.length
    ? "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
    : "";
  return apiFetch<{
    success: boolean;
    data: AdminUser[];
    total: number;
    current_page: number;
    last_page: number;
  }>(`/admin/users${qs}`);
}

export function updateAdminUser(
  id: number,
  payload: {
    name?: string;
    email?: string;
    password?: string;
    status?: "active" | "suspended";
  },
) {
  return apiFetch<{ success: boolean; message: string; data: AdminUser }>(
    `/admin/users/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
}

export function updateAdminUserStatus(id: number, status: "active" | "suspended") {
  return apiFetch<{ success: boolean; message: string; data: AdminUser }>(
    `/admin/users/${id}/status`,
    { method: "PUT", body: JSON.stringify({ status }) },
  );
}

export function deleteAdminUser(id: number) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/users/${id}`,
    { method: "DELETE" },
  );
}

// ---------- Admin: System Config ----------

export interface SystemConfig {
  id: number;
  telegram_token: string | null;
  telegram_chat_id: string | null;
  authorized_user_id: string | null;
  binance_affiliatelink: string | null;
  mexc_affiliatelink: string | null;
  bybit_affiliate_link: string | null;
  binance_referral_code: string | null;
  mexc_referral_code: string | null;
  bybit_referral_code: string | null;
  binance_webhook: string | null;
  mexc_webhook: string | null;
  bybit_webhook: string | null;
  is_maintenance: boolean;
  created_at: string;
  updated_at: string;
}

export type SystemConfigUpdate = Partial<Omit<SystemConfig, "id" | "created_at" | "updated_at">>;

export function getAdminSystemConfig() {
  return apiFetch<{ success: boolean; data: SystemConfig }>("/admin/config");
}

export function updateAdminSystemConfig(payload: SystemConfigUpdate) {
  return apiFetch<{ success: boolean; message: string; data: SystemConfig }>(
    "/admin/config",
    { method: "PUT", body: JSON.stringify(payload) },
  );
}
