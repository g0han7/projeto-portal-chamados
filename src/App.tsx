import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import CollaboratorPortal from './components/CollaboratorPortal';
import AttendantPortal from './components/AttendantPortal';
import ProjectPortal from './components/ProjectPortal';
import { User, AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('granCoffeeUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('granCoffeeUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('granCoffeeUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-950 font-medium">Carregando GranCoffee...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100">
          {!currentUser ? (
            <LoginPage onLogin={handleLogin} />
          ) : currentUser.role === 'colaborador' ? (
            <CollaboratorPortal user={currentUser} onLogout={handleLogout} />
          ) : currentUser.role === 'desenvolvedor' ? (
            <ProjectPortal user={currentUser} onLogout={handleLogout} />
          ) : (
            <AttendantPortal user={currentUser} onLogout={handleLogout} />
          )}
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;