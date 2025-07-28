import React from 'react';
import { Clock, User, AlertCircle, Play, Eye, Code } from 'lucide-react';
import { Project } from '../contexts/DataContext';
import { User as UserType } from '../contexts/AuthContext';

interface ProjectCardProps {
  project: Project;
  currentUser: UserType;
  showActions?: boolean;
  onStartWork?: (projectId: string) => void;
  onView?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUser,
  showActions = false,
  onStartWork,
  onView
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Em Desenvolvimento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Testes':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Em Homologação':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Finalizado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Muito Baixa':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canStartWork = () => {
    return project.status === 'Pendente' && project.assignedTo === 'Não Atribuído';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    onView?.(project.id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 text-lg">
              {project.projectNumber}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Prioridade:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>{project.requestedFor}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{new Date(project.lastUpdated).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Atribuído a:</span>
            <span className="ml-1">{project.assignedTo}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-3 mb-4">
          {project.description}
        </p>

        {showActions && (
          <div className="flex space-x-2">
            {canStartWork() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartWork?.(project.id);
                }}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                <Play className="h-4 w-4 mr-1" />
                Iniciar Trabalho
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(project.id);
              }}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              <Eye className="h-4 w-4 mr-1" />
              Visualizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;