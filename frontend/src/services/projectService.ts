import { api } from './api';
import type { Project, Page, GraphData } from '@/types';

export interface ProjectListItem {
  id: string;
  name: string;
  thumbnail?: string;
  updatedAt: number;
}

export const projectService = {
  // List all projects
  async list(): Promise<ProjectListItem[]> {
    const { data, error } = await api.get<ProjectListItem[]>('/projects');
    if (error) throw new Error(error);
    return data || [];
  },
  
  // Get a single project
  async get(id: string): Promise<Project> {
    const { data, error } = await api.get<Project>(`/projects/${id}`);
    if (error) throw new Error(error);
    if (!data) throw new Error('Project not found');
    return data;
  },
  
  // Create a new project
  async create(name: string): Promise<Project> {
    const { data, error } = await api.post<Project>('/projects', { name });
    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to create project');
    return data;
  },
  
  // Update project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await api.patch<Project>(`/projects/${id}`, updates);
    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to update project');
    return data;
  },
  
  // Delete project
  async delete(id: string): Promise<void> {
    const { error } = await api.delete(`/projects/${id}`);
    if (error) throw new Error(error);
  },
  
  // Save project pages
  async savePages(projectId: string, pages: Page[]): Promise<void> {
    const { error } = await api.put(`/projects/${projectId}/pages`, { pages });
    if (error) throw new Error(error);
  },
  
  // Get a specific page
  async getPage(projectId: string, pageId: string): Promise<Page> {
    const { data, error } = await api.get<Page>(`/projects/${projectId}/pages/${pageId}`);
    if (error) throw new Error(error);
    if (!data) throw new Error('Page not found');
    return data;
  },
  
  // Save page data
  async savePageData(projectId: string, pageId: string, graphData: GraphData): Promise<void> {
    const { error } = await api.put(`/projects/${projectId}/pages/${pageId}/data`, graphData);
    if (error) throw new Error(error);
  },
  
  // Upload asset (image)
  async uploadAsset(file: File): Promise<{ url: string; id: string }> {
    const { data, error } = await api.upload<{ url: string; id: string }>('/assets/upload', file);
    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to upload asset');
    return data;
  },
  
  // Upload SVG shape
  async uploadSvg(file: File): Promise<{ url: string; id: string }> {
    const { data, error } = await api.upload<{ url: string; id: string }>('/assets/svg', file);
    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to upload SVG');
    return data;
  },
};