const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

let accessToken = null;
let refreshPromise = null;
let sessionExpiredHandler = null;

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message ?? 'Something went wrong. Please try again.',
      response.status,
      data.errors,
    );
  }

  return data;
};

const fetchJson = (path, options = {}) =>
  fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = fetchJson('/auth/refresh', { method: 'POST' })
      .then(parseResponse)
      .then((data) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .catch((error) => {
        setAccessToken(null);
        sessionExpiredHandler?.();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const request = async (path, options = {}, retryAfterRefresh = true) => {
  const response = await fetchJson(path, options);

  if (response.status === 401 && retryAfterRefresh && accessToken && path !== '/auth/refresh') {
    await refreshSession();
    return request(path, options, false);
  }

  return parseResponse(response);
};

const withJsonBody = (method, values) => ({
  method,
  body: JSON.stringify(values),
});

const withQuery = (path, values = {}) => {
  const query = new URLSearchParams(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

  return query.size ? `${path}?${query}` : path;
};

export const api = {
  login: (credentials) => request('/auth/login', withJsonBody('POST', credentials), false),
  register: (values) => request('/auth/register', withJsonBody('POST', values), false),
  restoreSession: refreshSession,
  logout: async () => {
    try {
      return await request('/auth/logout', { method: 'POST' }, false);
    } finally {
      setAccessToken(null);
    }
  },
  getMe: () => request('/auth/me'),
  getProfile: () => request('/users/profile'),
  updateProfile: (values) => request('/users/profile', withJsonBody('PUT', values)),
  createIncome: (values) => request('/income', withJsonBody('POST', values)),
  getIncome: (filters) => request(withQuery('/income', filters)),
  updateIncome: (id, values) => request(`/income/${id}`, withJsonBody('PUT', values)),
  deleteIncome: (id) => request(`/income/${id}`, { method: 'DELETE' }),
  createExpense: (values) => request('/expenses', withJsonBody('POST', values)),
  getExpenses: (filters) => request(withQuery('/expenses', filters)),
  updateExpense: (id, values) => request(`/expenses/${id}`, withJsonBody('PUT', values)),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  getExpenseSummary: (filters) => request(withQuery('/expenses/summary', filters)),
  getMonthlyReport: (months = 6) => request(withQuery('/reports/monthly', { months })),
  createHabit: (values) => request('/habits', withJsonBody('POST', values)),
  getHabits: (filters) => request(withQuery('/habits', filters)),
  getHabit: (id) => request(`/habits/${id}`),
  updateHabit: (id, values) => request(`/habits/${id}`, withJsonBody('PUT', values)),
  deleteHabit: (id) => request(`/habits/${id}`, { method: 'DELETE' }),
  completeHabit: (id, date) =>
    request(`/habits/${id}/complete`, withJsonBody('POST', date ? { date } : {})),
  getHabitStreak: (id) => request(`/habits/${id}/streak`),
  getHabitSummary: () => request('/habits/summary'),
  createGoal: (values) => request('/goals', withJsonBody('POST', values)),
  getGoals: () => request('/goals'),
  getGoal: (id) => request(`/goals/${id}`),
  updateGoal: (id, values) => request(`/goals/${id}`, withJsonBody('PUT', values)),
  deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
  contributeToGoal: (id, values) =>
    request(`/goals/${id}/contribute`, withJsonBody('POST', values)),
  getGoalProgress: (id) => request(`/goals/${id}/progress`),
  createAsset: (values) => request('/assets', withJsonBody('POST', values)),
  getAssets: () => request('/assets'),
  getAsset: (id) => request(`/assets/${id}`),
  updateAsset: (id, values) => request(`/assets/${id}`, withJsonBody('PUT', values)),
  deleteAsset: (id) => request(`/assets/${id}`, { method: 'DELETE' }),
  createNetWorthSnapshot: () => request('/networth/snapshot', { method: 'POST' }),
  getNetWorthHistory: (range) => request(withQuery('/networth/history', { range })),
  getDashboardSummary: () => request('/dashboard/summary'),
  submitFeedback: (values) => request('/feedback', withJsonBody('POST', values)),
  getAdminUsers: (filters) => request(withQuery('/admin/users', filters)),
  updateAdminUser: (id, values) => request(`/admin/users/${id}`, withJsonBody('PUT', values)),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminAnalytics: () => request('/admin/analytics'),
  getAdminFeedback: (filters) => request(withQuery('/admin/feedback', filters)),
  updateAdminFeedback: (id, values) =>
    request(`/admin/feedback/${id}`, withJsonBody('PUT', values)),
};
