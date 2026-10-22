const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const getAuthToken = () => localStorage.getItem('ailifeos_token');
export const setAuthToken = (token) => localStorage.setItem('ailifeos_token', token);
export const removeAuthToken = () => localStorage.removeItem('ailifeos_token');

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, config);
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || `HTTP ${res.status}: Failed request`);
    }
    return result;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err.message);
    throw err;
  }
}

// ── AUTH API ───────────────────────────────────────────
export const apiLogin = (email, password) =>
  apiRequest('/api/auth/login', 'POST', { email, password });

export const apiRegister = (name, email, password, role = 'user') =>
  apiRequest('/api/auth/register', 'POST', { name, email, password, role });

export const apiGetMe = () => apiRequest('/api/auth/me', 'GET');

export const apiGetCoaches = () => apiRequest('/api/auth/coaches', 'GET');

export const apiAssignCoach = (coachId) =>
  apiRequest('/api/auth/assign-coach', 'PUT', { coachId });

export const apiUpdateProfile = (profileData) =>
  apiRequest('/api/auth/profile', 'PUT', profileData);

// ── AI CHAT API (GROQ + OLLAMA) ──────────────────────
export const apiAskAI = (prompt, systemMsg = '', provider = 'auto') =>
  apiRequest('/api/ai/chat', 'POST', { prompt, system: systemMsg, provider });

export const apiGetAIStatus = () => apiRequest('/api/ai/status', 'GET');

// ── DAILY TASKS & JOURNAL API ────────────────────────
export const apiGetTasks = () => apiRequest('/api/daily/tasks', 'GET');
export const apiCreateTask = (task) => apiRequest('/api/daily/tasks', 'POST', task);
export const apiUpdateTask = (id, updates) => apiRequest(`/api/daily/tasks/${id}`, 'PUT', updates);
export const apiDeleteTask = (id) => apiRequest(`/api/daily/tasks/${id}`, 'DELETE');

export const apiGetJournals = () => apiRequest('/api/daily/journal', 'GET');
export const apiCreateJournal = (journal) => apiRequest('/api/daily/journal', 'POST', journal);

// ── FINANCE API ──────────────────────────────────────
export const apiGetFinance = () => apiRequest('/api/finance', 'GET');
export const apiUpdateFinance = (data) => apiRequest('/api/finance', 'PUT', data);
export const apiAddExpense = (expense) => apiRequest('/api/finance/expense', 'POST', expense);
export const apiDeleteExpense = (id) => apiRequest(`/api/finance/expense/${id}`, 'DELETE');
export const apiAddGoal = (goal) => apiRequest('/api/finance/goal', 'POST', goal);

// ── STARTUP API ──────────────────────────────────────
export const apiGetStartups = () => apiRequest('/api/startup', 'GET');
export const apiCreateStartup = (data) => apiRequest('/api/startup', 'POST', data);
export const apiUpdateStartup = (id, data) => apiRequest(`/api/startup/${id}`, 'PUT', data);

// ── MOVIES WATCHLIST API ──────────────────────────────
export const apiGetWatchlist = () => apiRequest('/api/movies/watchlist', 'GET');
export const apiAddWatchlist = (movie) => apiRequest('/api/movies/watchlist', 'POST', movie);
export const apiUpdateWatchlistMovie = (movieId, updates) => apiRequest(`/api/movies/watchlist/${movieId}`, 'PUT', updates);

// ── COACH PORTAL API ──────────────────────────────────
export const apiGetCoachClients = () => apiRequest('/api/coach/clients', 'GET');
export const apiGetClientDetails = (clientId) => apiRequest(`/api/coach/client/${clientId}`, 'GET');
export const apiAssignCoachTask = (clientId, taskData) => apiRequest(`/api/coach/task/${clientId}`, 'POST', taskData);

// ── ADMIN PANEL API ──────────────────────────────────
export const apiGetAdminStats = () => apiRequest('/api/admin/stats', 'GET');
export const apiGetAdminUsers = (query = '', role = '') => apiRequest(`/api/admin/users?query=${encodeURIComponent(query)}&role=${role}`, 'GET');
export const apiUpdateUserRole = (userId, role) => apiRequest(`/api/admin/user/${userId}/role`, 'PUT', { role });
export const apiDeleteUser = (userId) => apiRequest(`/api/admin/user/${userId}`, 'DELETE');
