import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'Contexto não inicializado' }),
  logout: () => {},
  isAdmin: () => false,
  isProfessional: () => false,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          // A resposta vem no formato: { success: true, data: { user: {...} } }
          const userData = response.data.data || response.data;
          
          if (!userData || !userData.id) {
            console.error('Resposta inválida do servidor:', response.data);
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      // A resposta vem no formato: { message: "...", data: { user: {...}, token: "..." } }
      const { user, token } = response.data.data || response.data;
      
      if (!user || !token) {
        console.error('Resposta inválida do servidor:', response.data);
        return { success: false, error: 'Resposta inválida do servidor' };
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.error || error.message || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data || response.data;
      if (userData && userData.id) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isProfessional = () => {
    return user?.role === 'PROFESSIONAL';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAdmin,
    isProfessional,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

