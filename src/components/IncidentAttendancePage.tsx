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
  Camera,
  Users,
  Shield,
  Info,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { User as UserType } from '../contexts/AuthContext';
import GamaAIChat from './GamaAIChat';
import ConfirmationModal from './ConfirmationModal';

interface IncidentAttendancePageProps {
  incidentId: string;
  onBack: () => void;
  currentUser: UserType;
}

const IncidentAttendancePage: React.FC<IncidentAttendancePageProps> = ({
  incidentId,
  onBack,
  currentUser
}) => {
  const { incidents, updateIncident, getUserDetail, searchKnowledge } = useData();
  const [activeTab, setActiveTab] = useState<'details' | 'evaluations' | 'knowledge' | 'closure'>('details');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showGamaAI, setShowGamaAI] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState<string | null>(null);
  const [suggestedPriority, setSuggestedPriority] = useState('');
  const [localIncident, setLocalIncident] = useState<any>(null);
  const [attendants, setAttendants] = useState<string[]>([]);
  const [newAttendant, setNewAttendant] = useState('');
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

  const incident = incidents.find(inc => inc.id === incidentId);

  useEffect(() => {
    if (incident) {
      setLocalIncident({ ...incident });
      setTimerSeconds(incident.timerDuration * 60); // Convert minutes to seconds
      // Initialize with current user if assigned
      if (incident.assignedTo !== 'Não Atribuído') {
        setAttendants([incident.assignedTo]);
      }
    }
  }, [incident]);

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
    // Atribuir automaticamente ao usuário que inicia o atendimento
    if (incident) {
      updateIncident(incidentId, {
        assignedTo: currentUser.name,
        status: 'Em Andamento'
      });
      setLocalIncident(prev => ({
        ...prev,
        assignedTo: currentUser.name,
        status: 'Em Andamento'
      }));
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    // Timer pauses but keeps the accumulated time
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    // Timer stops but keeps the accumulated time
  };

  const handleAssignToMe = () => {
    if (incident) {
      updateIncident(incidentId, {
        assignedTo: currentUser.name,
        status: 'Em Andamento'
      });
      setLocalIncident(prev => ({
        ...prev,
        assignedTo: currentUser.name,
        status: 'Em Andamento'
      }));
    }
  };

  const handleSuggestPriority = () => {
    const priorities = ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Crítica'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    setSuggestedPriority(randomPriority);
  };

  const handleSave = () => {
    if (localIncident) {
      updateIncident(incidentId, {
        ...localIncident,
        timerDuration: Math.floor(timerSeconds / 60),
        treatments: treatments
      });
    }
    setShowConfirmation({ type: 'save', show: false });
  };

  const addAttendant = () => {
    if (newAttendant.trim() && !attendants.includes(newAttendant.trim())) {
      setAttendants([...attendants, newAttendant.trim()]);
      setNewAttendant('');
    }
  };

  const removeAttendant = (attendant: string) => {
    setAttendants(attendants.filter(a => a !== attendant));
  };
  const handleFinalize = () => {
    if (incident) {
      updateIncident(incidentId, {
        ...localIncident,
        status: 'Finalizado',
        timerDuration: Math.floor(timerSeconds / 60),
        treatments: treatments
      });
      setLocalIncident(prev => ({ ...prev, status: 'Finalizado' }));
    }
    setShowConfirmation({ type: 'finalize', show: false });
  };

  const handleCancel = () => {
    if (incident) {
      updateIncident(incidentId, {
        ...localIncident,
        status: 'Cancelado',
        timerDuration: Math.floor(timerSeconds / 60),
        treatments: treatments
      });
      setLocalIncident(prev => ({ ...prev, status: 'Cancelado' }));
    }
    setShowConfirmation({ type: 'cancel', show: false });
  };

  const handleAddTreatment = () => {
    if (!localIncident.newTreatment?.trim()) return;

    const newTreatment = {
      id: Date.now().toString(),
      content: localIncident.newTreatment,
      isPublic: localIncident.isPublicTreatment || false,
      author: currentUser.name,
      timestamp: new Date().toISOString()
    };

    setTreatments(prev => [...prev, newTreatment]);
    
    // Apenas limpa o formulário
    setLocalIncident(prev => ({ 
      ...prev, 
      newTreatment: '', 
      isPublicTreatment: false 
    }));
  };

  const getRelatedArticles = () => {
    if (!incident) return [];
    return searchKnowledge(incident.description).slice(0, 3);
  };

  const relatedArticles = getRelatedArticles();

  if (!incident || !localIncident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-coffee-950 mb-4">Incidente não encontrado</h2>
          <button
            onClick={onBack}
            className="btn-primary"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const isAttendant = currentUser.role === 'atendente';
  const canStartAttendance = localIncident.status !== 'Em Andamento' && localIncident.assignedTo !== currentUser.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-coffee-50 to-coffee-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#51913B] via-[#4A8235] to-[#457A32] text-white shadow-2xl relative overflow-hidden">
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
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {localIncident.incidentNumber}
                </h1>
                <p className="text-green-100">
                  Solicitado por <span className="text-white font-medium">{localIncident.requestedFor}</span>
                </p>
              </div>
            </div>

            {/* Timer and Actions */}
            {isAttendant && (
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-sm">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg font-semibold">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {canStartAttendance && (
                    <button
                      onClick={handleStartTimer}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 backdrop-blur-sm"
                    >
                      <Play className="h-4 w-4" />
                      <span>Começar</span>
                    </button>
                  )}
                  
                  {localIncident.assignedTo === currentUser.name && (
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
                  ? 'border-[#51913B] text-[#51913B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluations'
                  ? 'border-[#51913B] text-[#51913B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Timeline de Tratativas
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'knowledge'
                  ? 'border-[#51913B] text-[#51913B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Base de Conhecimento
            </button>
            <button
              onClick={() => setActiveTab('closure')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'closure'
                  ? 'border-[#51913B] text-[#51913B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Encerramento
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-coffee-950 mb-6">Detalhes do Incidente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Chamado
                  </label>
                  <input
                    type="text"
                    value={localIncident.incidentNumber}
                    readOnly
                    className="input-primary bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitado por
                    <button
                      onClick={() => setShowUserInfo(localIncident.requestedFor)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <Info className="h-4 w-4 inline" />
                    </button>
                  </label>
                  <input
                    type="text"
                    value={localIncident.requestedFor}
                    readOnly
                    className="input-primary bg-gray-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={localIncident.description}
                    onChange={(e) => {
                      if (isAttendant) {
                        setLocalIncident(prev => ({ ...prev, description: e.target.value }));
                      }
                    }}
                    rows={4}
                    className="input-primary"
                    readOnly={!isAttendant}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={localIncident.priority}
                    className="input-primary"
                    disabled={!isAttendant}
                    onChange={(e) => {
                      if (isAttendant) {
                        setLocalIncident(prev => ({ ...prev, priority: e.target.value }));
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
                    value={localIncident.status}
                    className="input-primary"
                    disabled={!isAttendant}
                    onChange={(e) => {
                      if (isAttendant) {
                        setLocalIncident(prev => ({ ...prev, status: e.target.value }));
                      }
                    }}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando Solicitante">Aguardando Solicitante</option>
                    <option value="Resolvido">Resolvido</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atribuído a
                    {localIncident.assignedTo !== 'Não Atribuído' && (
                      <button
                        onClick={() => setShowUserInfo(localIncident.assignedTo)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <Info className="h-4 w-4 inline" />
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={localIncident.assignedTo}
                    readOnly
                    className="input-primary bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 O chamado será atribuído automaticamente ao atendente que iniciar o timer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={localIncident.type}
                    className="input-primary"
                    disabled={!isAttendant}
                    onChange={(e) => {
                      if (isAttendant) {
                        setLocalIncident(prev => ({ ...prev, type: e.target.value }));
                      }
                    }}
                  >
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Rede">Rede</option>
                    <option value="Acesso">Acesso</option>
                    <option value="Impressora">Impressora</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chamado Pai (Opcional)
                    <span className="text-xs text-gray-500 ml-2">
                      - Vincule a um chamado principal para resolver múltiplos problemas relacionados
                    </span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={localIncident.parentIncident || ''}
                      onChange={(e) => {
                        if (isAttendant) {
                          setLocalIncident(prev => ({ ...prev, parentIncident: e.target.value }));
                        }
                      }}
                      className="input-primary flex-1"
                      placeholder="Ex: INC001234"
                      disabled={!isAttendant}
                    />
                    {isAttendant && (
                      <button
                        onClick={() => {
                          // Aqui você pode implementar uma busca de chamados
                          alert('Funcionalidade de busca de chamados será implementada');
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
                      >
                        🔍 Buscar
                      </button>
                    )}
                  </div>
                  {localIncident.parentIncident && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">
                          Vinculado ao chamado: {localIncident.parentIncident}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        As tratativas deste chamado serão sincronizadas com o chamado pai
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-coffee-950 mb-6">Timeline de Tratativas</h2>
              
              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-aroma-400 to-aroma-600"></div>
                
                {/* Timeline Items */}
                <div className="space-y-8">
                  {/* Abertura do Chamado */}
                  <div className="relative flex items-start space-x-6">
                    <div className="timeline-node-primary flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">Chamado Aberto</h3>
                          <span className="text-xs text-gray-500">
                            {new Date(localIncident.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Chamado aberto por <strong>{localIncident.openedBy}</strong>
                        </p>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-800">{localIncident.description}</p>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-aroma-100 text-aroma-700 border border-aroma-200">
                            👁️ Público
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Atribuição */}
                  {localIncident.assignedTo !== 'Não Atribuído' && (
                    <div className="relative flex items-start space-x-6">
                      <div className="timeline-node-info flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">Chamado Atribuído</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(localIncident.lastUpdated).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            Chamado atribuído para <strong>{localIncident.assignedTo}</strong>
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-aroma-100 text-aroma-700 border border-aroma-200">
                              👁️ Público
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comentários Públicos */}
                  {localIncident.additionalComments && (
                    <div className="relative flex items-start space-x-6">
                      <div className="timeline-node-success flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">Comentário do Atendente</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(localIncident.lastUpdated).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded p-3">
                            <p className="text-sm text-gray-800">{localIncident.additionalComments}</p>
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-aroma-100 text-aroma-700 border border-aroma-200">
                              👁️ Público
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Anotações Internas */}
                  {localIncident.workNotes && (
                    <div className="relative flex items-start space-x-6">
                      <div className="timeline-node-warning flex-shrink-0">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">Anotação Interna</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(localIncident.lastUpdated).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="bg-white rounded p-3">
                            <div className="text-sm text-gray-800 whitespace-pre-wrap">{localIncident.workNotes}</div>
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                              🔒 Interno
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tratativas Adicionais */}
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="relative flex items-start space-x-6">
                      <div className={`timeline-node flex-shrink-0 ${treatment.isPublic ? 'timeline-node-success' : 'timeline-node-warning'}`}>
                        {treatment.isPublic ? <MessageCircle className="h-5 w-5 text-white" /> : <Shield className="h-5 w-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`border rounded-lg p-4 shadow-sm ${treatment.isPublic ? 'bg-white border-gray-200' : 'bg-yellow-50 border-yellow-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {treatment.isPublic ? 'Comentário do Atendente' : 'Anotação Interna'}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {new Date(treatment.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            Por <strong>{treatment.author}</strong>
                          </p>
                          <div className={`rounded p-3 ${treatment.isPublic ? 'bg-gray-50' : 'bg-white'}`}>
                            <div className="text-sm text-gray-800 whitespace-pre-wrap">{treatment.content}</div>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              treatment.isPublic 
                                ? 'bg-aroma-100 text-aroma-700 border-aroma-200' 
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                              {treatment.isPublic ? '👁️ Público' : '🔒 Interno'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Nova Entrada */}
                  {isAttendant && (
                    <div className="relative flex items-start space-x-6">
                      <div className="timeline-node-primary flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Adicionar Nova Tratativa</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comentário/Anotação
                              </label>
                              <textarea
                                value={localIncident.newTreatment || ''}
                                onChange={(e) => setLocalIncident(prev => ({ ...prev, newTreatment: e.target.value }))}
                                rows={4}
                                className="input-primary"
                                placeholder="Adicione sua tratativa..."
                              />
                            </div>

                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="visibleToRequester"
                                checked={localIncident.isPublicTreatment || false}
                                onChange={(e) => setLocalIncident(prev => ({ ...prev, isPublicTreatment: e.target.checked }))}
                                className="h-4 w-4 text-aroma-600 focus:ring-aroma-500 border-gray-300 rounded"
                              />
                              <label htmlFor="visibleToRequester" className="text-sm font-medium text-gray-700">
                                👁️ Visível ao solicitante
                              </label>
                            </div>

                            <button
                              onClick={() => {
                                handleAddTreatment();
                              }}
                              disabled={!localIncident.newTreatment?.trim()}
                              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Adicionar Tratativa
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
                <h2 className="text-2xl font-bold text-coffee-950">Base de Conhecimento</h2>
                <button
                  onClick={() => setShowGamaAI(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Conversar com GAMA AI</span>
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">Artigos Relacionados</h3>

              {relatedArticles.length > 0 ? (
                <div className="space-y-4">
                  {relatedArticles.map((article) => (
                    <div key={article.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{article.content}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Categoria:</span>
                        <span className="badge-info text-xs">
                          {article.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum artigo relacionado encontrado.</p>
                  <button
                    onClick={() => setShowGamaAI(true)}
                    className="btn-primary mt-4"
                  >
                    Consultar GAMA AI
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'closure' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-coffee-950 mb-6">Encerramento do Chamado</h2>
              
              {/* Multiple Attendants Section */}
              <div className="bg-aroma-50 border border-aroma-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-aroma-900 mb-4">Atendentes Envolvidos</h3>
                
                {/* Current Attendants */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {attendants.map((attendant, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-aroma-100 text-aroma-800 border border-aroma-300"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {attendant}
                        {isAttendant && (
                          <button
                            onClick={() => removeAttendant(attendant)}
                            className="ml-2 text-aroma-600 hover:text-aroma-800"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {attendants.length === 0 && (
                      <p className="text-aroma-600 text-sm">Nenhum atendente adicionado</p>
                    )}
                  </div>
                </div>

                {/* Add New Attendant */}
                {isAttendant && (
                  <div className="flex space-x-2">
                    <select
                      value={newAttendant}
                      onChange={(e) => setNewAttendant(e.target.value)}
                      className="flex-1 px-4 py-2 border border-aroma-300 rounded-lg focus:ring-2 focus:ring-aroma-500 focus:border-transparent bg-white"
                    >
                      <option value="">Selecionar atendente...</option>
                      <option value="Lucas Matias Ferreira">Lucas Matias Ferreira</option>
                      <option value="João Silva">João Silva</option>
                      <option value="Maria Oliveira">Maria Oliveira</option>
                      <option value="Carlos Souza">Carlos Souza</option>
                      <option value="Ana Costa">Ana Costa</option>
                      <option value="Pedro Santos">Pedro Santos</option>
                    </select>
                    <button
                      onClick={addAttendant}
                      disabled={!newAttendant.trim()}
                      className="px-4 py-2 bg-aroma-600 text-white rounded-lg hover:bg-aroma-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conclusão do Chamado
                </label>
                <textarea
                  value={localIncident.conclusion}
                  onChange={(e) => {
                    if (isAttendant) {
                      setLocalIncident(prev => ({ ...prev, conclusion: e.target.value }));
                    }
                  }}
                  rows={8}
                  className="input-primary"
                  placeholder="Descreva como o problema foi resolvido e quais ações foram tomadas..."
                  disabled={!isAttendant}
                />
              </div>

              {isAttendant && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmation({ type: 'save', show: true })}
                    className="btn-secondary"
                  >
                    Salvar Rascunho
                  </button>
                  <button
                    onClick={() => setShowConfirmation({ type: 'finalize', show: true })}
                    className="btn-success"
                  >
                    Finalizar Chamado
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* User Info Modal */}
      {showUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações do Usuário</h3>
              <button
                onClick={() => setShowUserInfo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            {(() => {
              const userDetail = getUserDetail(showUserInfo);
              if (!userDetail) {
                return <p className="text-gray-500">Usuário não encontrado.</p>;
              }
              
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="text-gray-900">{userDetail.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TAG</label>
                    <p className="text-gray-900">{userDetail.tag}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <p className="text-gray-900">{userDetail.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Departamento</label>
                    <p className="text-gray-900">{userDetail.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Superior</label>
                    <p className="text-gray-900">{userDetail.superior}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* GAMA AI Chat Modal */}
      {showGamaAI && (
        <GamaAIChat
          onClose={() => setShowGamaAI(false)}
          initialMessage="Olá! Sou a GAMA AI, sua assistente de base de conhecimento. Posso ajudá-lo a encontrar soluções para problemas técnicos. Descreva o problema que você está enfrentando."
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
          showConfirmation.type === 'finalize' ? 'Finalizar Chamado' :
          'Cancelar Chamado'
        }
        message={
          showConfirmation.type === 'save' ? 'Deseja salvar as alterações feitas no chamado?' :
          showConfirmation.type === 'finalize' ? 'Tem certeza que deseja finalizar este chamado? Esta ação não pode ser desfeita.' :
          'Tem certeza que deseja cancelar este chamado? Esta ação não pode ser desfeita.'
        }
        type={showConfirmation.type}
        risks={
          showConfirmation.type === 'finalize' ? [
            'O chamado será marcado como finalizado',
            'O solicitante será notificado automaticamente',
            'Não será possível reabrir o chamado'
          ] :
          showConfirmation.type === 'cancel' ? [
            'O chamado será marcado como cancelado',
            'Todo o trabalho realizado será perdido',
            'O solicitante será notificado do cancelamento'
          ] : []
        }
      />
    </div>
  );
};

export default IncidentAttendancePage;