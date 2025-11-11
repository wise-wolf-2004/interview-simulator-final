import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load from localStorage on init
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage');
      }
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE}/register`, { email, password, name });
    this.setAuth(response.data);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE}/login`, { email, password });
    this.setAuth(response.data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    
    this.user = response.data;
    localStorage.setItem('user', JSON.stringify(this.user));
    return response.data;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private setAuth(data: AuthResponse) {
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
