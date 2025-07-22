import React, { useState } from 'react';
import { User, LogOut, Filter, Search, ArrowUpDown, Plus, CheckCircle, BookOpen } from 'lucide-react';
import { User as UserType } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import IncidentCard from './IncidentCard';
import IncidentAttendancePage from './IncidentAttendancePage';
import KnowledgeBasePage from './KnowledgeBasePage';

interface CollaboratorPortalProps {
  user: UserType;
  onLogout: () => void;
}

const CollaboratorPortal: React.FC<CollaboratorPortalProps> = ({ user, onLogout }) => {
  const { incidents, addIncident } = useData();
  const [activeTab, setActiveTab] = useState<'myIncidents' | 'newIncident' | 'knowledge'>('myIncidents');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showAttendancePage, setShowAttendancePage] = useState(false);
  const [showKnowledgePage, setShowKnowledgePage] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form states for new incident
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filterIncidents = (incidentsList: any[]) => {
    let filtered = [...incidentsList];

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(incident => incident.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(incident => incident.priority === filters.priority);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'priority') {
        const priorityOrder = { 'Crítica': 5, 'Alta': 4, 'Média': 3, 'Baixa': 2, 'Muito Baixa': 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      } else {
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  };

  const myIncidents = filterIncidents(incidents.filter(incident => 
    incident.requestedFor === user.name || incident.openedBy === user.name
  ));

  const handleViewIncident = (incidentId: string) => {
    setSelectedIncident(incidentId);
    setShowAttendancePage(true);
  };

  const handleShowKnowledge = () => {
    setShowKnowledgePage(true);
  };

  const handleCloseAttendance = () => {
    setShowAttendancePage(false);
    setSelectedIncident(null);
  };

  const handleCloseKnowledge = () => {
    setShowKnowledgePage(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newIncident = {
      id: Date.now().toString(),
      incidentNumber: `INC${String(Date.now()).slice(-6)}`,
      requestedFor: user.name,
      status: 'Pendente',
      priority: 'Média', // Será definido pela IA
      assignedGroup: 'Suporte Técnico',
      assignedTo: 'Não Atribuído',
      description: description.trim(),
      workNotes: '',
      additionalComments: '',
      conclusion: '',
      timerDuration: 0,
      lastUpdated: new Date().toISOString(),
      openedBy: user.name,
      type: type || 'Outro',
      impact: 'Médio', // Será definido pela IA
      createdAt: new Date().toISOString()
    };

    // Add the incident to the data context
    addIncident(newIncident);
    
    // Reset form
    setDescription('');
    setType('');
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Show success and switch to my incidents tab
    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab('myIncidents');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100">
      {/* Conditional rendering moved inside JSX */}
      {showAttendancePage && selectedIncident && (
        <IncidentAttendancePage
          incidentId={selectedIncident}
          onBack={handleCloseAttendance}
          currentUser={user}
        />
      )}

      {showKnowledgePage && (
        <KnowledgeBasePage
          onBack={handleCloseKnowledge}
          currentUser={user}
        />
      )}

      {/* Main portal content - only show when not in attendance or knowledge mode */}
      {!showAttendancePage && !showKnowledgePage && (
        <>
          {/* Header */}
          <header className="bg-white shadow-md border-b border-coffee-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                    <img 
                      src="/image.png" 
                      alt="GranCoffee Logo" 
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-coffee-950">Portal do Colaborador</h1>
                    <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-coffee-950 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setActiveTab('myIncidents')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'myIncidents'
                      ? 'bg-[#51913B] text-white shadow-md'
                      : 'text-gray-600 hover:text-coffee-950 hover:bg-gray-50'
                  }`}
                >
                  Meus Chamados
                </button>
                <button
                  onClick={() => setActiveTab('newIncident')}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'newIncident'
                      ? 'bg-[#51913B] text-white shadow-md'
                      : 'text-gray-600 hover:text-coffee-950 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Abrir Chamado
                </button>
                <button
                  onClick={() => setActiveTab('knowledge')}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'knowledge'
                      ? 'bg-[#51913B] text-white shadow-md'
                      : 'text-gray-600 hover:text-coffee-950 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Base de Conhecimento
                </button>
              </nav>
            </div>

            {/* Filters */}
            {activeTab === 'myIncidents' && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent text-sm"
                    >
                      <option value="">Todos os Status</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Aguardando Solicitante">Aguardando Solicitante</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent text-sm"
                    >
                      <option value="">Todas as Prioridades</option>
                      <option value="Crítica">Crítica</option>
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Muito Baixa">Muito Baixa</option>
                    </select>
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Ordenar por:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent text-sm"
                    >
                      <option value="priority">Prioridade</option>
                      <option value="date">Data</option>
                    </select>
                  </div>
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-[#38261E] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                  </button>
                </div>
              </div>
            )}

            {/* My Incidents */}
            {activeTab === 'myIncidents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-coffee-950">Meus Chamados</h2>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-600">Total: </span>
                    <span className="font-semibold text-[#51913B]">{myIncidents.length}</span>
                  </div>
                </div>

                {myIncidents.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
                    <p className="text-gray-600">Você ainda não possui chamados ou eles não correspondem aos filtros aplicados.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myIncidents.map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        currentUser={user}
                        showActions={false}
                        onView={handleViewIncident}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New Incident Form */}
            {activeTab === 'newIncident' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-coffee-950 mb-6">Abrir Novo Chamado</h2>
                  
                  {showSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">Chamado criado com sucesso!</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmitIncident} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descreva o Problema *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                        placeholder="Ex: Computador não está ligando, software X está travando, não consigo acessar a rede, etc."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Problema
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="Software">Software</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Rede">Rede</option>
                          <option value="Acesso">Acesso</option>
                          <option value="Impressora">Impressora</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-800 font-medium">
                          A prioridade e impacto serão definidos automaticamente pela IA com base na descrição do problema
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setDescription('');
                          setType('');
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Limpar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !description.trim()}
                        className="px-8 py-3 bg-[#51913B] text-white rounded-xl font-semibold hover:bg-[#457A32] focus:outline-none focus:ring-2 focus:ring-[#51913B] focus:ring-offset-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Criando...' : 'Abrir Chamado'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Knowledge Base */}
            {activeTab === 'knowledge' && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Base de Conhecimento</h3>
                <p className="text-gray-600 mb-6">Acesse nossa biblioteca completa de soluções e procedimentos.</p>
                <button
                  onClick={handleShowKnowledge}
                  className="px-6 py-3 bg-[#51913B] text-white rounded-xl font-semibold hover:bg-[#457A32] focus:outline-none focus:ring-2 focus:ring-[#51913B] focus:ring-offset-2 transition-all duration-200 transform active:scale-95"
                >
                  Abrir Base de Conhecimento
                </button>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default CollaboratorPortal;