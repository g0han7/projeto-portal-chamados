import React, { useState, useCallback } from 'react';
import { User, LogOut, Filter, Search, ArrowUpDown, Plus, CheckCircle, BookOpen, Code, Layers } from 'lucide-react';
import { User as UserType } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import ProjectCard from './ProjectCard';
import ProjectAttendancePage from './ProjectAttendancePage';
import KnowledgeBasePage from './KnowledgeBasePage';

interface ProjectPortalProps {
  user: UserType;
  onLogout: () => void;
}

const ProjectPortal: React.FC<ProjectPortalProps> = ({ user, onLogout }) => {
  const { projects } = useData();
  const [activeTab, setActiveTab] = useState<'myProjects' | 'queue' | 'all' | 'newProject' | 'knowledge'>('myProjects');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showAttendancePage, setShowAttendancePage] = useState(false);
  const [showKnowledgePage, setShowKnowledgePage] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    priority: ''
  });
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form states for new project
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [requestedFor, setRequestedFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { addProject } = useData();

  const filterProjects = (projectsList: any[]) => {
    let filtered = [...projectsList];

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    if (filters.assignedTo && activeTab === 'all') {
      filtered = filtered.filter(project => project.assignedTo === filters.assignedTo);
    }
    if (filters.priority) {
      filtered = filtered.filter(project => project.priority === filters.priority);
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

  const getTabProjects = () => {
    switch (activeTab) {
      case 'myProjects':
        return filterProjects(projects.filter(project => project.assignedTo === user.name));
      case 'queue':
        return filterProjects(projects.filter(project => 
          project.status === 'Pendente' && project.assignedTo === 'Não Atribuído'
        ));
      case 'all':
        return filterProjects(projects);
      case 'newProject':
      case 'knowledge':
        return [];
      default:
        return [];
    }
  };

  const tabProjects = getTabProjects();

  const handleStartWork = (projectId: string) => {
    setSelectedProject(projectId);
    setShowAttendancePage(true);
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProject(projectId);
    setShowAttendancePage(true);
  };

  const handleShowKnowledge = () => {
    setShowKnowledgePage(true);
  };

  const handleCloseAttendance = useCallback(() => {
    setShowAttendancePage(false);
    setSelectedProject(null);
  }, []);

  const handleCloseKnowledge = useCallback(() => {
    setShowKnowledgePage(false);
  }, []);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !requestedFor.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newProject = {
      id: Date.now().toString(),
      projectNumber: `PRJ${String(Date.now()).slice(-6)}`,
      requestedFor: requestedFor.trim(),
      status: 'Pendente',
      priority: priority || 'Média',
      assignedGroup: 'Projetos',
      assignedTo: 'Não Atribuído',
      description: description.trim(),
      workNotes: '',
      additionalComments: '',
      conclusion: '',
      timerDuration: 0,
      lastUpdated: new Date().toISOString(),
      openedBy: user.name,
      type: type || 'Desenvolvimento',
      impact: 'Médio',
      createdAt: new Date().toISOString()
    };

    addProject(newProject);
    
    // Reset form
    setDescription('');
    setType('');
    setPriority('');
    setRequestedFor('');
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Show success and switch to queue tab
    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab('queue');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Conditional rendering moved inside JSX */}
      {showAttendancePage && selectedProject && (
        <ProjectAttendancePage
          projectId={selectedProject}
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
          <header className="bg-white shadow-md border-b border-indigo-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 shadow-sm">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Portal de Projetos</h1>
                    <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
                  onClick={() => setActiveTab('myProjects')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'myProjects'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Meus Projetos
                </button>
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'queue'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Fila de Projetos
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Todos os Projetos
                </button>
                <button
                  onClick={() => setActiveTab('newProject')}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'newProject'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Projeto
                </button>
                <button
                  onClick={() => setActiveTab('knowledge')}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'knowledge'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Base de Conhecimento
                </button>
              </nav>
            </div>

            {/* Filters */}
            {activeTab !== 'newProject' && activeTab !== 'knowledge' && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      <option value="">Todos os Status</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                      <option value="Em Testes">Em Testes</option>
                      <option value="Em Homologação">Em Homologação</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      <option value="">Todas as Prioridades</option>
                      <option value="Crítica">Crítica</option>
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Muito Baixa">Muito Baixa</option>
                    </select>
                  </div>

                  {/* Assigned To Filter */}
                  {activeTab === 'all' && (
                    <div>
                      <select
                        value={filters.assignedTo}
                        onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      >
                        <option value="">Todos os Responsáveis</option>
                        <option value="Pedro Santos">Pedro Santos</option>
                        <option value="Lívia Rodrigues">Lívia Rodrigues</option>
                        <option value="Carlos Souza">Carlos Souza</option>
                        <option value="Ana Costa">Ana Costa</option>
                        <option value="Não Atribuído">Não Atribuído</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Ordenar por:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      <option value="priority">Prioridade</option>
                      <option value="date">Data</option>
                    </select>
                  </div>
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                  </button>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {activeTab !== 'newProject' && activeTab !== 'knowledge' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'myProjects' && 'Meus Projetos'}
                    {activeTab === 'queue' && 'Fila de Projetos'}
                    {activeTab === 'all' && 'Todos os Projetos'}
                  </h2>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-600">Total: </span>
                    <span className="font-semibold text-indigo-600">{tabProjects.length}</span>
                  </div>
                </div>

                {tabProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-gray-600">Não há projetos que correspondam aos filtros aplicados.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tabProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        currentUser={user}
                        showActions={true}
                        onStartWork={handleStartWork}
                        onView={handleViewProject}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New Project Form */}
            {activeTab === 'newProject' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Projeto</h2>
                  
                  {showSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">Projeto criado com sucesso!</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmitProject} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solicitado por *
                      </label>
                      <input
                        type="text"
                        value={requestedFor}
                        onChange={(e) => setRequestedFor(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Nome do solicitante"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição do Projeto *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Descreva o projeto, objetivos e requisitos..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Projeto
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="Desenvolvimento">Desenvolvimento</option>
                          <option value="Manutenção">Manutenção</option>
                          <option value="Integração">Integração</option>
                          <option value="Migração">Migração</option>
                          <option value="Análise">Análise</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prioridade
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Selecione a prioridade</option>
                          <option value="Muito Baixa">Muito Baixa</option>
                          <option value="Baixa">Baixa</option>
                          <option value="Média">Média</option>
                          <option value="Alta">Alta</option>
                          <option value="Crítica">Crítica</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setDescription('');
                          setType('');
                          setPriority('');
                          setRequestedFor('');
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Limpar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !description.trim() || !requestedFor.trim()}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Criando...' : 'Criar Projeto'}
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
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-95"
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

export default ProjectPortal;