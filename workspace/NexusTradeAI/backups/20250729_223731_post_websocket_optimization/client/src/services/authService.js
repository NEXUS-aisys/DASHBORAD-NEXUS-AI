class AuthService {
  // WARNING: This is a mock authentication service. Replace with a real implementation.
  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic validation
    if (!email || !email.includes('@') || !password || password.length < 6) {
      throw new Error('Invalid email or password. Password must be at least 6 characters.');
    }

    // In a real app, this would be an API request to authenticate
    // For now, we'll simulate a simple validation
    const validEmails = ['demo@example.com', 'test@example.com', 'admin@nexus.ai'];

    // Check if it's a known email (simulated authentication)
    if (validEmails.includes(email.toLowerCase()) || email.endsWith('@gmail.com')) {
      const mockUser = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        accessToken: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-' + Date.now()
      };

      localStorage.setItem('nexus_user', JSON.stringify(mockUser));
      return mockUser;
    } else {
      // Simulate authentication failure for unknown emails
      throw new Error('Invalid credentials. Please try again.');
    }
  }

  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Enhanced validation
    if (!userData.name || userData.name.length < 2) {
      throw new Error('Please enter a valid name (at least 2 characters).');
    }

    if (!userData.email || !userData.email.includes('@') || !userData.email.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // In a real app, check if email already exists
    // For now, we'll simulate accepting the registration
    const mockUser = {
      id: 'user-' + Date.now(),
      name: userData.name,
      email: userData.email,
      accessToken: 'mock-token-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('nexus_user', JSON.stringify(mockUser));
    return mockUser;
  }

  async logout() {
    localStorage.removeItem('nexus_user');
  }

  updateUser(userData) {
    localStorage.setItem('nexus_user', JSON.stringify(userData));
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('nexus_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      localStorage.removeItem('nexus_user');
      return null;
    }
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!(user && user.accessToken);
  }

  async oauthLogin(provider) {
    // Simulate OAuth authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real app, this would redirect to the OAuth provider
    // and handle the callback with a token exchange
    // For demo purposes, we'll create mock data based on the provider

    let mockUser;
    if (provider === 'google') {
      mockUser = {
        id: 'google-' + Date.now(),
        name: 'Google User',
        email: 'google.user@gmail.com',
        accessToken: 'google-oauth-token-' + Date.now(),
        provider: 'google',
        profileImage: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff'
      };
    } else if (provider === 'github') {
      mockUser = {
        id: 'github-' + Date.now(),
        name: 'GitHub User',
        email: 'github.user@example.com',
        accessToken: 'github-oauth-token-' + Date.now(),
        provider: 'github',
        profileImage: 'https://ui-avatars.com/api/?name=GitHub+User&background=181717&color=fff'
      };
    } else {
      throw new Error('Invalid authentication provider');
    }

    localStorage.setItem('nexus_user', JSON.stringify(mockUser));
    return mockUser;
  }
}

const authService = new AuthService();
export default authService;