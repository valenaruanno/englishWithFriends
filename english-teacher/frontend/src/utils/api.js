// Configuración base de la API
// En producción, usa URLs relativas (mismo dominio)
// En desarrollo, usa localhost si VITE_API_URL no está definido

const getApiBaseUrl = () => {
  // Si VITE_API_URL está definido, úsalo (desarrollo)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En producción, usar URLs relativas (mismo dominio)
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Fallback para desarrollo local
  return 'http://localhost:8080/api';
};

const getFileBaseUrl = () => {
  // Si VITE_API_URL está definido, úsalo sin /api
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  
  // En producción, usar URL relativa (mismo dominio)
  if (import.meta.env.PROD) {
    return '';
  }
  
  // Fallback para desarrollo local
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();
export const API_FILE_BASE_URL = getFileBaseUrl();

const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Función helper para hacer peticiones API
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Solo agregar token para rutas administrativas
  const isAdminRoute = endpoint.includes('/create') || 
                      endpoint.includes('/update') || 
                      endpoint.includes('/delete') || 
                      endpoint.includes('/admin') ||
                      endpoint.includes('/upload') ||
                      (endpoint.startsWith('/activities') && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE'));

  // Obtener token si existe y la ruta lo necesita
  const token = isAdminRoute ? authUtils.getAuthToken() : null;

  const config = {
    ...apiConfig,
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && apiConfig.headers), // Solo agregar headers default si no es FormData
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Solo verificar autenticación en rutas administrativas
    if (isAdminRoute && (response.status === 401 || response.status === 403)) {
      console.warn('Token expirado o inválido - Logout automático');
      authUtils.logout();
      // Redirigir al home si no estamos ya ahí
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Verificar si la respuesta tiene contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      console.log('Response text:', text);
      return text ? JSON.parse(text) : null;
    } else {
      // Si no es JSON, devolver null o el texto
      return response.status === 204 ? null : await response.text();
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Funciones de gestión de autenticación
export const authUtils = {
  // Verificar si la sesión es válida
  isSessionValid: () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const sessionExpiration = localStorage.getItem('sessionExpiration');
    
    if (!isAuthenticated || !sessionExpiration) {
      return false;
    }
    
    const currentTime = new Date().getTime();
    const expirationTime = parseInt(sessionExpiration);
    
    if (currentTime > expirationTime) {
      // Sesión expirada, limpiar localStorage
      authUtils.logout();
      return false;
    }
    
    return true;
  },

  // Obtener datos del usuario autenticado
  getAuthenticatedUser: () => {
    if (!authUtils.isSessionValid()) {
      return null;
    }
    
    const teacherData = localStorage.getItem('teacherData');
    return teacherData ? JSON.parse(teacherData) : null;
  },

  // Obtener token de autenticación
  getAuthToken: () => {
    if (!authUtils.isSessionValid()) {
      return null;
    }
    
    return localStorage.getItem('authToken');
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('teacherData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('sessionExpiration');
  },

  // Obtener tiempo restante de sesión en minutos
  getSessionTimeRemaining: () => {
    const sessionExpiration = localStorage.getItem('sessionExpiration');
    if (!sessionExpiration) return 0;
    
    const currentTime = new Date().getTime();
    const expirationTime = parseInt(sessionExpiration);
    const timeRemaining = expirationTime - currentTime;
    
    return Math.max(0, Math.floor(timeRemaining / (1000 * 60))); // en minutos
  }
};

// Funciones específicas para cada endpoint
export const authAPI = {
  // Login de administrador
  login: async (email, password) => {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Verificar si el email existe
  checkEmail: async (email) => {
    return await apiCall('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }
};

export const teacherAPI = {
  getTeacherById: (id = 1) => apiCall(`/teachers/${id}`),

  // Niveles
  getAllLevels: () => apiCall('/levels'),
  getLevelByName: (name) => apiCall(`/levels/by-name/${name}`),
  createLevel: (levelData) => apiCall('/levels', {
    method: 'POST',
    body: JSON.stringify(levelData)
  }),
  updateLevel: (id, levelData) => apiCall(`/levels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(levelData)
  }),
  deleteLevel: (id) => apiCall(`/levels/${id}`, {
    method: 'DELETE'
  }),

  // Actividades
  getAllActivities: () => apiCall('/activities'),
  getActivitiesByLevel: (levelId) => apiCall(`/activities/level/${levelId}`),
  createActivity: (activityData) => apiCall('/activities', {
    method: 'POST',
    body: JSON.stringify(activityData)
  }),
  updateActivity: (id, activityData) => apiCall(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(activityData)
  }),
  deleteActivity: (id) => apiCall(`/activities/${id}`, {
    method: 'DELETE'
  })
};

// API para manejo de archivos
export const fileAPI = {
  uploadActivityFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiCall('/files/upload/activity', {
      method: 'POST',
      body: formData,
      headers: {} // No incluir Content-Type, el browser lo agrega automáticamente para FormData
    });
    return response;
  },

  deleteActivityFile: (fileName) => apiCall(`/files/activities/${fileName}`, {
    method: 'DELETE'
  }),

  getFileUrl: (fileName) => `${API_BASE_URL}/files/activities/${fileName}`
};
