import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Save, 
  CheckCircle, 
  XCircle,
  MessageCircle,
  Users,
  Shield,
  Info,
  Code,
  ChevronRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { User as UserType } from '../contexts/AuthContext';
import GamaAIChat from './GamaAIChat';
import ConfirmationModal from './ConfirmationModal';

interface ProjectAttendancePageProps {
  projectId: string;
  onBack: () => void;
  currentUser: UserType;
}

const ProjectAttendancePage: React.FC<ProjectAttendancePageProps> = ({
  projectId,
  onBack,
  currentUser
}) => {
  const { projects, updateProject, getUserDetail, searchKnowledge } = useData();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'knowledge' | 'delivery'>('details');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showGamaAI, setShowGamaAI] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState<string | null>(null);
  const [localProject, setLocalProject] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState<{
    type: 'save' | 'finalize' | 'cancel';
    show: boolean;
  }>({ type: 'save', show: false });
  const [treatments, setTreatments] = useState<Array<{
    id: string;
    content: string;
    isPublic: boolean;
    author: string;
    timestamp: string;
  }>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const project = projects.find(proj => proj.id === projectId);

  useEffect(() => {
    if (project) {
      setLocalProject({ ...project });
      setTimerSeconds(project.timerDuration * 60);
      if (project.assignedTo !== 'Não Atribuído') {
        // Initialize treatments if needed
      }
    }
  }, [project]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (project) {
      updateProject(projectId, {
        assignedTo: currentUser.name,
        status: 'Em Desenvolvimento'
      });
      setLocalProject(prev => ({
        ...prev,
        assignedTo: currentUser.name,
        status: 'Em Desenvolvimento'
      }));
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
  };

  const handleSave = () => {
    if (localProject) {
      updateProject(projectId, {
        ...localProject,
        timerDuration: Math.floor(timerSeconds / 60),
        treatments: treatments
      });
    }
    setShowConfirmation({ type: 'save', show: false });
  };

  const handleFinalize = () => {
    if (project) {
      updateProject(projectId, {
        ...localProject,
        status: 'Finalizado',
        timerDuration: Math.floor(timerSeconds / 60),
        treatments: treatments
      });
      setLocalProject(prev => ({ ...prev, status: 'Finalizado' }));
    }
    setShowConfirmation({ type: 'finalize', show: false });
  };

  const handleCancel = () => {
    if (project) {
      updateProject(projectId, {
        ...localProject,
        status: 'Cancelado',
        timerDuration: Math.floor(timerSeconds / 60),
        treatments: treatments
      });
      setLocalProject(prev => ({ ...prev, status: 'Cancelado' }));
    }
    setShowConfirmation({ type: 'cancel', show: false });
  };

  const handleAddTreatment = () => {
    if (!localProject.newTreatment?.trim()) return;

    const newTreatment = {
      id: Date.now().toString(),
      content: localProject.newTreatment,
      isPublic: localProject.isPublicTreatment || false,
      author: currentUser.name,
      timestamp: new Date().toISOString()
    };

    setTreatments(prev => [...prev, newTreatment]);
    
    setLocalProject(prev => ({ 
      ...prev, 
      newTreatment: '', 
      isPublicTreatment: false 
    }));
  };

  if (!project || !localProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Projeto não encontrado</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const isDeveloper = currentUser.role === 'desenvolvedor' || currentUser.role === 'atendente';
  const canStartWork = localProject.status !== 'Em Desenvolvimento' && localProject.assignedTo !== currentUser.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-2xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
              <div className="h-6 w-px bg-white bg-opacity-30"></div>
              <div className="flex items-center space-x-3">
                <Code className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {localProject.projectNumber}
                  </h1>
                  <p className="text-indigo-100">
                    Solicitado por <span className="text-white font-medium">{localProject.requestedFor}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timer and Actions */}
            {isDeveloper && (
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-sm">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg font-semibold">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {canStartWork && (
                    <button
                      onClick={handleStartTimer}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                    >
                      <Play className="h-4 w-4" />
                      <span>Começar</span>
                    </button>
                  )}
                  
                  {localProject.assignedTo === currentUser.name && (
                    <>
                      <button
                        onClick={isTimerRunning ? handlePauseTimer : handleStartTimer}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                      >
                        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>{isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                      </button>
                      
                      <button
                        onClick={handleStopTimer}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                      >
                        <Square className="h-4 w-4" />
                        <span>Parar</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowConfirmation({ type: 'save', show: true })}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                  
                  <button
                    onClick={() => setShowConfirmation({ type: 'finalize', show: true })}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Finalizar</span>
                  </button>
                  
                  <button
                    onClick={() => setShowConfirmation({ type: 'cancel', show: true })}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'knowledge'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Base de Conhecimento
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'delivery'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrega
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalhes do Projeto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Projeto
                  </label>
                  <input
                    type="text"
                    value={localProject.projectNumber}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitado por
                  </label>
                  <input
                    type="text"
                    value={localProject.requestedFor}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={localProject.description}
                    onChange={(e) => {
                      if (isDeveloper) {
                        setLocalProject(prev => ({ ...prev, description: e.target.value }));
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    readOnly={!isDeveloper}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={localProject.priority}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={!isDeveloper}
                    onChange={(e) => {
                      if (isDeveloper) {
                        setLocalProject(prev => ({ ...prev, priority: e.target.value }));
                      }
                    }}
                  >
                    <option value="Muito Baixa">Muito Baixa</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={localProject.status}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={!isDeveloper}
                    onChange={(e) => {
                      if (isDeveloper) {
                        setLocalProject(prev => ({ ...prev, status: e.target.value }));
                      }
                    }}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                    <option value="Em Testes">Em Testes</option>
                    <option value="Em Homologação">Em Homologação</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atribuído a
                  </label>
                  <input
                    type="text"
                    value={localProject.assignedTo}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={localProject.type}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={!isDeveloper}
                    onChange={(e) => {
                      if (isDeveloper) {
                        setLocalProject(prev => ({ ...prev, type: e.target.value }));
                      }
                    }}
                  >
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Integração">Integração</option>
                    <option value="Migração">Migração</option>
                    <option value="Análise">Análise</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline do Projeto</h2>
              
              {/* Similar timeline structure as IncidentAttendancePage but adapted for projects */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600"></div>
                
                <div className="space-y-8">
                  {/* Project Creation */}
                  <div className="relative flex items-start space-x-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-gradient-to-r from-indigo-500 to-indigo-600">
                      <Code className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">Projeto Criado</h3>
                          <span className="text-xs text-gray-500">
                            {new Date(localProject.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Projeto criado por <strong>{localProject.openedBy}</strong>
                        </p>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-800">{localProject.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add new treatment form for developers */}
                  {isDeveloper && (
                    <div className="relative flex items-start space-x-6">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-gradient-to-r from-indigo-500 to-indigo-600">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Adicionar Atualização</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Atualização do Projeto
                              </label>
                              <textarea
                                value={localProject.newTreatment || ''}
                                onChange={(e) => setLocalProject(prev => ({ ...prev, newTreatment: e.target.value }))}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Adicione uma atualização sobre o progresso do projeto..."
                              />
                            </div>

                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="visibleToRequester"
                                checked={localProject.isPublicTreatment || false}
                                onChange={(e) => setLocalProject(prev => ({ ...prev, isPublicTreatment: e.target.checked }))}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="visibleToRequester" className="text-sm font-medium text-gray-700">
                                👁️ Visível ao solicitante
                              </label>
                            </div>

                            <button
                              onClick={handleAddTreatment}
                              disabled={!localProject.newTreatment?.trim()}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Adicionar Atualização
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Base de Conhecimento</h2>
                <button
                  onClick={() => setShowGamaAI(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar com GAMA AI
                </button>
              </div>

              <p className="text-gray-600">
                Recursos e documentação técnica para desenvolvimento de projetos.
              </p>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrega do Projeto</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relatório de Entrega
                </label>
                <textarea
                  value={localProject.conclusion || ''}
                  onChange={(e) => {
                    if (isDeveloper) {
                      setLocalProject(prev => ({ ...prev, conclusion: e.target.value }));
                    }
                  }}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Descreva o que foi desenvolvido, funcionalidades implementadas, testes realizados e instruções de uso..."
                  disabled={!isDeveloper}
                />
              </div>

              {isDeveloper && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmation({ type: 'save', show: true })}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Salvar Rascunho
                  </button>
                  <button
                    onClick={() => setShowConfirmation({ type: 'finalize', show: true })}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Finalizar Projeto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* GAMA AI Chat Modal */}
      {showGamaAI && (
        <GamaAIChat
          onClose={() => setShowGamaAI(false)}
          initialMessage="Olá! Sou a GAMA AI. Posso ajudá-lo com documentação técnica, melhores práticas de desenvolvimento e soluções para desafios de projeto. Como posso ajudar?"
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showConfirmation.show}
        onClose={() => setShowConfirmation({ ...showConfirmation, show: false })}
        onConfirm={
          showConfirmation.type === 'save' ? handleSave :
          showConfirmation.type === 'finalize' ? handleFinalize :
          handleCancel
        }
        title={
          showConfirmation.type === 'save' ? 'Salvar Alterações' :
          showConfirmation.type === 'finalize' ? 'Finalizar Projeto' :
          'Cancelar Projeto'
        }
        message={
          showConfirmation.type === 'save' ? 'Deseja salvar as alterações feitas no projeto?' :
          showConfirmation.type === 'finalize' ? 'Tem certeza que deseja finalizar este projeto? Esta ação não pode ser desfeita.' :
          'Tem certeza que deseja cancelar este projeto? Esta ação não pode ser desfeita.'
        }
        type={showConfirmation.type}
        risks={
          showConfirmation.type === 'finalize' ? [
            'O projeto será marcado como finalizado',
            'O solicitante será notificado automaticamente',
            'Não será possível reabrir o projeto'
          ] :
          showConfirmation.type === 'cancel' ? [
            'O projeto será marcado como cancelado',
            'Todo o trabalho realizado será perdido',
            'O solicitante será notificado do cancelamento'
          ] : []
        }
      />
    </div>
  );
};

export default ProjectAttendancePage;