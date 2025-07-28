import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { User as UserType } from '../contexts/AuthContext';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const credentials = {
    atendente: {
      password: 'suporte',
      user: {
        id: 'att1',
        username: 'atendente',
        name: 'Lucas Matias Ferreira',
        email: 'lucas.ferreira@grancoffee.com',
        role: 'atendente' as const,
        department: 'Suporte Técnico',
        tag: 'LUCAS.FERREIRA'
      }
    },
    colaborador: {
      password: 'senha123',
      user: {
        id: 'col1',
        username: 'colaborador',
        name: 'João Silva',
        email: 'joao.silva@grancoffee.com',
        role: 'colaborador' as const,
        department: 'Tecnologia da Informação',
        tag: 'JOAO.SILVA'
      }
    },
    desenvolvedor: {
      password: 'dev123',
      user: {
        id: 'dev1',
        username: 'desenvolvedor',
        name: 'Carlos Souza',
        email: 'carlos.souza@grancoffee.com',
        role: 'desenvolvedor' as const,
        department: 'Desenvolvimento',
        tag: 'CARLOS.SOUZA'
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const credential = credentials[username as keyof typeof credentials];
    
    if (credential && credential.password === password) {
      onLogin(credential.user);
    } else {
      setError('Credenciais inválidas. Verifique seu usuário e senha.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 via-coffee-200 to-coffee-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img 
                src="/image.png" 
                alt="GranCoffee Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-coffee-950 mb-2">
            GranCoffee
          </h2>
          <p className="text-coffee-700">
            Sistema de Gestão de Incidentes
          </p>
        </div>

        {/* Login Form */}
        <form className="bg-white p-8 rounded-2xl shadow-xl space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-600 focus:border-transparent transition-all duration-200"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-600 focus:border-transparent transition-all duration-200"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-coffee-700 text-white py-3 px-4 rounded-xl font-semibold hover:bg-coffee-800 focus:outline-none focus:ring-2 focus:ring-coffee-600 focus:ring-offset-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="h-5 w-5 mr-2" />
                Entrar
              </div>
            )}
          </button>
        </form>

        {/* Credentials Info */}
        <div className="bg-white bg-opacity-90 border border-coffee-300 rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-coffee-900 mb-3">Credenciais de Teste:</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <p className="font-medium text-coffee-800">Atendente de Suporte:</p>
              <p className="text-coffee-700">Usuário: <span className="font-mono bg-coffee-200 px-2 py-1 rounded">atendente</span></p>
              <p className="text-coffee-700">Senha: <span className="font-mono bg-coffee-200 px-2 py-1 rounded">suporte</span></p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-medium text-green-800">Colaborador:</p>
              <p className="text-green-700">Usuário: <span className="font-mono bg-green-200 px-2 py-1 rounded">colaborador</span></p>
              <p className="text-green-700">Senha: <span className="font-mono bg-green-200 px-2 py-1 rounded">senha123</span></p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-medium text-blue-800">Desenvolvedor:</p>
              <p className="text-blue-700">Usuário: <span className="font-mono bg-blue-200 px-2 py-1 rounded">desenvolvedor</span></p>
              <p className="text-blue-700">Senha: <span className="font-mono bg-blue-200 px-2 py-1 rounded">dev123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;