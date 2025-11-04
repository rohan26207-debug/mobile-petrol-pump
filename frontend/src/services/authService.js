// Authentication Service
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async register(username, password, fullName = null) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      this.setAuth(data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      this.setAuth(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.token) return null;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      this.logout();
      return null;
    }
  }

  setAuth(data) {
    this.token = data.access_token;
    this.user = {
      id: data.user_id,
      username: data.username
    };
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }
}

export default new AuthService();
