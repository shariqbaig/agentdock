// frontend/src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { Agent, Tool, ToolCategory } from '../services/api';

interface AppContextType {
  // Agents
  agents: Agent[];
  selectedAgent: Agent | null;
  loadingAgents: boolean;
  fetchAgents: () => Promise<void>;
  selectAgent: (name: string) => Promise<void>;
  createAgent: (agent: Agent) => Promise<void>;
  updateAgent: (name: string, agent: Partial<Agent>) => Promise<void>;
  deleteAgent: (name: string) => Promise<void>;
  
  // Tools
  tools: Tool[];
  toolCategories: Record<string, ToolCategory>;
  loadingTools: boolean;
  fetchTools: () => Promise<void>;
  fetchToolCategories: () => Promise<void>;
  
  // Status
  isOnline: boolean;
  serverStatus: string;
  checkServerStatus: () => Promise<void>;
}

const defaultContext: AppContextType = {
  agents: [],
  selectedAgent: null,
  loadingAgents: false,
  fetchAgents: async () => {},
  selectAgent: async () => {},
  createAgent: async () => {},
  updateAgent: async () => {},
  deleteAgent: async () => {},
  
  tools: [],
  toolCategories: {},
  loadingTools: false,
  fetchTools: async () => {},
  fetchToolCategories: async () => {},
  
  isOnline: false,
  serverStatus: 'offline',
  checkServerStatus: async () => {},
};

export const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Agents state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loadingAgents, setLoadingAgents] = useState<boolean>(false);
  
  // Tools state
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolCategories, setToolCategories] = useState<Record<string, ToolCategory>>({});
  const [loadingTools, setLoadingTools] = useState<boolean>(false);
  
  // Server status
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<string>('checking');
  
  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
    
    // Set up interval to check server status
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch initial data
  useEffect(() => {
    if (isOnline) {
      fetchAgents();
      fetchTools();
      fetchToolCategories();
    }
  }, [isOnline]);
  
  // Agent methods
  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const agentsData = await apiService.getAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };
  
  const selectAgent = async (name: string) => {
    try {
      const agent = await apiService.getAgent(name);
      setSelectedAgent(agent);
    } catch (error) {
      console.error(`Error fetching agent ${name}:`, error);
    }
  };
  
  const createAgent = async (agent: Agent) => {
    try {
      await apiService.createAgent(agent);
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  };
  
  const updateAgent = async (name: string, agent: Partial<Agent>) => {
    try {
      await apiService.updateAgent(name, agent);
      fetchAgents();
      if (selectedAgent && selectedAgent.name === name) {
        selectAgent(name);
      }
    } catch (error) {
      console.error(`Error updating agent ${name}:`, error);
      throw error;
    }
  };
  
  const deleteAgent = async (name: string) => {
    try {
      await apiService.deleteAgent(name);
      fetchAgents();
      if (selectedAgent && selectedAgent.name === name) {
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error(`Error deleting agent ${name}:`, error);
      throw error;
    }
  };
  
  // Tool methods
  const fetchTools = async () => {
    try {
      setLoadingTools(true);
      const toolsData = await apiService.getTools();
      setTools(toolsData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoadingTools(false);
    }
  };
  
  const fetchToolCategories = async () => {
    try {
      const categories = await apiService.getToolCategories();
      setToolCategories(categories);
    } catch (error) {
      console.error('Error fetching tool categories:', error);
    }
  };
  
  // Server status check
  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      const response = await apiService.healthCheck();
      setIsOnline(response.status === 'ok');
      setServerStatus(response.status === 'ok' ? 'online' : 'offline');
    } catch (error) {
      console.error('Error checking server status:', error);
      setIsOnline(false);
      setServerStatus('offline');
    }
  };
  
  // Context value
  const contextValue: AppContextType = {
    agents,
    selectedAgent,
    loadingAgents,
    fetchAgents,
    selectAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    
    tools,
    toolCategories,
    loadingTools,
    fetchTools,
    fetchToolCategories,
    
    isOnline,
    serverStatus,
    checkServerStatus,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};