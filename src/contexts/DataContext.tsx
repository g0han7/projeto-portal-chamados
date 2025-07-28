import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockUserDetails, exampleIncidents, knowledgeBaseArticles } from '../data/mockData';

export interface Incident {
  id: string;
  incidentNumber: string;
  requestedFor: string;
  status: string;
  priority: string;
  assignedGroup: string;
  assignedTo: string;
  description: string;
  workNotes: string;
  additionalComments: string;
  conclusion: string;
  timerDuration: number;
  lastUpdated: string;
  openedBy: string;
  type: string;
  impact: string;
  createdAt: string;
  parentIncident?: string;
  treatments?: Array<{
    id: string;
    content: string;
    isPublic: boolean;
    author: string;
    timestamp: string;
  }>;
}

export interface Project {
  id: string;
  projectNumber: string;
  requestedFor: string;
  status: string;
  priority: string;
  assignedGroup: string;
  assignedTo: string;
  description: string;
  workNotes: string;
  additionalComments: string;
  conclusion: string;
  timerDuration: number;
  lastUpdated: string;
  openedBy: string;
  type: string;
  impact: string;
  createdAt: string;
  treatments?: Array<{
    id: string;
    content: string;
    isPublic: boolean;
    author: string;
    timestamp: string;
  }>;
}

export interface UserDetail {
  id: string;
  tag: string;
  email: string;
  department: string;
  superior: string;
  name: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
}

interface DataContextType {
  incidents: Incident[];
  projects: Project[];
  userDetails: UserDetail[];
  knowledgeArticles: KnowledgeArticle[];
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  addIncident: (incident: Incident) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProject: (project: Project) => void;
  getUserDetail: (name: string) => UserDetail | undefined;
  searchKnowledge: (query: string) => KnowledgeArticle[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(exampleIncidents);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userDetails] = useState<UserDetail[]>(mockUserDetails);
  const [knowledgeArticles] = useState<KnowledgeArticle[]>(knowledgeBaseArticles);

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === id 
          ? { ...incident, ...updates, lastUpdated: new Date().toISOString() }
          : incident
      )
    );
  };

  const addIncident = (incident: Incident) => {
    setIncidents(prev => [...prev, incident]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, lastUpdated: new Date().toISOString() }
          : project
      )
    );
  };

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const getUserDetail = (name: string) => {
    return userDetails.find(user => user.name === name);
  };

  const searchKnowledge = (query: string) => {
    const searchTerm = query.toLowerCase();
    return knowledgeArticles.filter(article => 
      article.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm) || 
        searchTerm.includes(keyword.toLowerCase())
      ) ||
      article.title.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <DataContext.Provider value={{
      incidents,
      projects,
      userDetails,
      knowledgeArticles,
      updateIncident,
      addIncident,
      updateProject,
      addProject,
      getUserDetail,
      searchKnowledge
    }}>
      {children}
    </DataContext.Provider>
  );
};