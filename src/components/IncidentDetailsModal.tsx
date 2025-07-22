import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Info, 
  Play, 
  Pause, 
  Square, 
  Save, 
  Shield, 
  CheckCircle, 
  XCircle,
  Clock,
  Camera,
  Users,
  MessageCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { User as UserType } from '../contexts/AuthContext';
import GamaAIChat from './GamaAIChat';

interface IncidentDetailsModalProps {
  incidentId: string;
  onClose: () => void;
  currentUser: UserType;
}

const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incidentId,
  onClose,
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const incident = incidents.find(inc => inc.id === incidentId);

  useEffect(() => {
    if (incident) {
      setLocalIncident({ ...incident });
    }
  }, [incident]);

  useEffect(() => {
    if (incident) {
      setTimerSeconds(incident.timerDuration * 60); // Convert minutes to seconds
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
    if (incident && incident.assignedTo !== currentUser.name) {
      updateIncident(incidentId, {
        assignedTo: currentUser.name,
        status: 'Em Andamento'
      });
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    if (incident) {
      updateIncident(incidentId, {
        timerDuration: Math.floor(timerSeconds / 60)
      });
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    if (incident) {
      updateIncident(incidentId, {
        timerDuration: Math.floor(timerSeconds / 60)
      });
    }
  };

  const handleAssignToMe = () => {
    if (incident) {
      updateIncident(incidentId, {
        assignedTo: currentUser.name,
        status: 'Em Andamento'
      });
    }
  };

  const handleSuggestPriority = () => {
    const priorities = ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Crítica'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    setSuggestedPriority(randomPriority);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Salvando alterações...');
  };

  const handleFinalize = () => {
    if (incident) {
      updateIncident(incidentId, {
        status: 'Finalizado'
      });
    }
  };

  const handleCancel = () => {
    if (incident) {
      updateIncident(incidentId, {
        status: 'Cancelado'
      });
    }
  };

  const getRelatedArticles = () => {
    if (!incident) return [];
    return searchKnowledge(incident.description).slice(0, 3);
  };

  const relatedArticles = getRelatedArticles();

  if (!incident || !localIncident) {
    return null;
  }

  const isAttendant = currentUser.role === 'atendente';
  const canStartAttendance = localIncident.status !== 'Em Andamento' && localIncident.assignedTo !== currentUser.name;
  const isCollaborator = currentUser.role === 'colaborador';
  const isMyIncident = localIncident.requestedFor === currentUser.name || localIncident.openedBy === currentUser.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#51913B] to-[#457A32] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-green-100">
                Incidente <ChevronRight className="h-4 w-4 inline" /> Detalhes
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Timer and Actions */}
          {isAttendant && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg font-semibold">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {canStartAttendance && (
                    <button
                      onClick={handleStartTimer}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                      <Play className="h-4 w-4" />
                      <span>Começar Atendimento</span>
                    </button>
                  )}
                  
                  {incident.assignedTo === currentUser.name && (
                    <>
                      <button
                        onClick={isTimerRunning ? handlePauseTimer : handleStartTimer}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                      >
                        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>{isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                      </button>
                      
                      <button
                        onClick={handleStopTimer}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                      >
                        <Square className="h-4 w-4" />
                        <span>Parar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors duration-200">
                  <Camera className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">2 online</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </button>
                  
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
                    <Shield className="h-4 w-4" />
                    <span>Privacidade</span>
                  </button>
                  
                  <button
                    onClick={handleFinalize}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Finalizar</span>
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-200px)]">
          {/* Tabs */}
          <div className="border-b border-gray-200">
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
                Avaliações
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
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Chamado
                    </label>
                    <input
                      type="text"
                      value={localIncident.incidentNumber}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                      readOnly={!isAttendant}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={localIncident.priority}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
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
                      Grupo Designado
                    </label>
                    <select
                      value={localIncident.assignedGroup}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                      disabled={!isAttendant}
                      onChange={(e) => {
                        if (isAttendant) {
                          setLocalIncident(prev => ({ ...prev, assignedGroup: e.target.value }));
                        }
                      }}
                    >
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Desenvolvimento">Desenvolvimento</option>
                      <option value="Segurança">Segurança</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atribuído a
                      <button
                        onClick={() => setShowUserInfo(localIncident.assignedTo)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <Info className="h-4 w-4 inline" />
                      </button>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={localIncident.assignedTo}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                      {isAttendant && localIncident.assignedTo !== currentUser.name && (
                        <button
                          onClick={handleAssignToMe}
                          className="px-4 py-3 bg-[#51913B] text-white rounded-lg hover:bg-[#457A32] transition-colors duration-200"
                        >
                          Atribuir a mim
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={localIncident.status}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
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
                </div>
              </div>
            )}

            {activeTab === 'evaluations' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anotações de trabalho
                    <span className="text-xs text-gray-500 ml-2">(apenas para equipe interna)</span>
                  </label>
                  <textarea
                    value={localIncident.workNotes}
                    onChange={(e) => {
                      if (isAttendant) {
                        setLocalIncident(prev => ({ ...prev, workNotes: e.target.value }));
                      }
                    }}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50"
                    placeholder="Adicione suas anotações internas sobre o atendimento..."
                    disabled={!isAttendant}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentários adicionais
                    <span className="text-xs text-gray-500 ml-2">(visível ao cliente)</span>
                  </label>
                  <textarea
                    value={localIncident.additionalComments}
                    onChange={(e) => {
                      if (isAttendant) {
                        setLocalIncident(prev => ({ ...prev, additionalComments: e.target.value }));
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                    placeholder="Adicione comentários que serão visíveis ao solicitante..."
                    disabled={!isAttendant}
                  />
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Artigos Relacionados</h3>
                  <button
                    onClick={() => setShowGamaAI(true)}
                    className="flex items-center px-4 py-2 bg-[#51913B] text-white rounded-lg hover:bg-[#457A32] transition-colors duration-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Conversar com GAMA AI
                  </button>
                </div>

                {relatedArticles.length > 0 ? (
                  <div className="space-y-4">
                    {relatedArticles.map((article) => (
                      <div key={article.id} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{article.content}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Categoria:</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {article.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum artigo relacionado encontrado.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'closure' && (
              <div className="space-y-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51913B] focus:border-transparent"
                    placeholder="Descreva como o problema foi resolvido e quais ações foram tomadas..."
                    disabled={!isAttendant}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info Modal */}
      {showUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações do Usuário</h3>
              <button
                onClick={() => setShowUserInfo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
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
    </div>
  );
};

export default IncidentDetailsModal;