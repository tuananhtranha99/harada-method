const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  // Chuẩn hoá: xoá dấu gạch chéo cuối và xoá /api/v1 nếu người dùng lỡ điền thừa
  return envUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
};

const API_BASE_URL = getBaseUrl();

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  characterName: string;
  characterLevel: number;
  totalXp: number;
  hp: number;
  maxHp: number;
  currentStreak: number;
  consecutiveMissedDays: number;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserProfile;
}

export interface GearItem {
  id: string;
  code: string;
  name: string;
  category: string;
  requiredLevel: number;
  spriteKey: string;
  equipped: boolean;
}

export interface ActionItem {
  id: string;
  slotIndex: number;
  title: string;
  xpReward: number;
  completedToday: boolean;
}

export interface PillarItem {
  id?: string;
  slotIndex: number;
  title: string;
  statCode: string;
  statLevel: number;
  statXp?: number;
  litToday?: boolean;
  actions: ActionItem[];
}

export interface DashboardData {
  user: UserProfile;
  goalId: string;
  goalTitle: string;
  goalPurpose?: string;
  pillars: PillarItem[];
  unlockedGear: GearItem[];
}

class ApiClient {
  private tokenKey = 'harada_access_token';

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  clearAccessToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
    const token = this.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    const payload = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || `HTTP ${response.status}`);
    }
    return payload;
  }

  // Auth
  async register(email: string, password: string, characterName: string): Promise<AuthResponseData> {
    const res = await this.request<AuthResponseData>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, characterName })
    });
    this.setAccessToken(res.data.accessToken);
    return res.data;
  }

  async login(email: string, password: string): Promise<AuthResponseData> {
    const res = await this.request<AuthResponseData>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setAccessToken(res.data.accessToken);
    return res.data;
  }

  logout(): void {
    this.clearAccessToken();
  }

  // Harada Quest
  async getDashboard(): Promise<DashboardData> {
    const res = await this.request<DashboardData>('/api/v1/harada/dashboard');
    return res.data;
  }

  async updateGoal(title: string, purpose?: string): Promise<DashboardData> {
    const res = await this.request<DashboardData>('/api/v1/harada/goal', {
      method: 'PUT',
      body: JSON.stringify({ title, purpose })
    });
    return res.data;
  }

  async updatePillar(slotIndex: number, title: string): Promise<DashboardData> {
    const res = await this.request<DashboardData>(`/api/v1/harada/pillars/${slotIndex}`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    });
    return res.data;
  }

  async addAction(slotIndex: number, title: string): Promise<DashboardData> {
    const res = await this.request<DashboardData>(`/api/v1/harada/pillars/${slotIndex}/actions`, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    return res.data;
  }

  async toggleAction(actionId: string): Promise<DashboardData> {
    const res = await this.request<DashboardData>(`/api/v1/harada/actions/${actionId}/toggle`, {
      method: 'POST'
    });
    return res.data;
  }
}

export const apiClient = new ApiClient();
