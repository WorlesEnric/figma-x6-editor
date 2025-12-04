import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Page, Project, GraphData } from '@/types';

interface PageStore {
  // Project
  project: Project | null;
  setProject: (project: Project) => void;
  
  // Pages
  pages: Page[];
  currentPageId: string | null;
  currentPage: Page | null;
  
  // Page operations
  addPage: (name?: string) => Page;
  deletePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  duplicatePage: (id: string) => Page | null;
  setCurrentPage: (id: string) => void;
  updatePageData: (id: string, data: GraphData) => void;
  updatePageThumbnail: (id: string, thumbnail: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  
  // Initialize with default page
  initialize: () => void;
}

const createDefaultPage = (name: string = 'Page 1'): Page => ({
  id: uuidv4(),
  name,
  data: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const usePageStore = create<PageStore>((set, get) => ({
  // Initial state
  project: null,
  pages: [],
  currentPageId: null,
  currentPage: null,
  
  setProject: (project) => {
    set({
      project,
      pages: project.pages,
      currentPageId: project.currentPageId,
      currentPage: project.pages.find(p => p.id === project.currentPageId) || null,
    });
  },
  
  initialize: () => {
    const existingPages = get().pages;
    if (existingPages.length === 0) {
      const defaultPage = createDefaultPage();
      set({
        pages: [defaultPage],
        currentPageId: defaultPage.id,
        currentPage: defaultPage,
      });
    }
  },
  
  addPage: (name) => {
    const { pages } = get();
    const pageName = name || `Page ${pages.length + 1}`;
    const newPage = createDefaultPage(pageName);
    
    set((state) => ({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
      currentPage: newPage,
    }));
    
    return newPage;
  },
  
  deletePage: (id) => {
    const { pages, currentPageId } = get();
    
    // Don't delete if it's the only page
    if (pages.length <= 1) return;
    
    const pageIndex = pages.findIndex(p => p.id === id);
    const newPages = pages.filter(p => p.id !== id);
    
    // If we're deleting the current page, switch to another
    let newCurrentId = currentPageId;
    if (currentPageId === id) {
      const newIndex = Math.min(pageIndex, newPages.length - 1);
      newCurrentId = newPages[newIndex]?.id || null;
    }
    
    set({
      pages: newPages,
      currentPageId: newCurrentId,
      currentPage: newPages.find(p => p.id === newCurrentId) || null,
    });
  },
  
  renamePage: (id, name) => {
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === id 
          ? { ...p, name, updatedAt: Date.now() }
          : p
      ),
      currentPage: state.currentPage?.id === id 
        ? { ...state.currentPage, name, updatedAt: Date.now() }
        : state.currentPage,
    }));
  },
  
  duplicatePage: (id) => {
    const { pages } = get();
    const sourcePage = pages.find(p => p.id === id);
    
    if (!sourcePage) return null;
    
    const newPage: Page = {
      ...sourcePage,
      id: uuidv4(),
      name: `${sourcePage.name} (copy)`,
      data: sourcePage.data ? JSON.parse(JSON.stringify(sourcePage.data)) : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const pageIndex = pages.findIndex(p => p.id === id);
    const newPages = [
      ...pages.slice(0, pageIndex + 1),
      newPage,
      ...pages.slice(pageIndex + 1),
    ];
    
    set({
      pages: newPages,
      currentPageId: newPage.id,
      currentPage: newPage,
    });
    
    return newPage;
  },
  
  setCurrentPage: (id) => {
    const { pages, currentPageId, currentPage: prevPage } = get();
    
    if (id === currentPageId) return;
    
    const page = pages.find(p => p.id === id);
    if (page) {
      set({
        currentPageId: id,
        currentPage: page,
      });
    }
  },
  
  updatePageData: (id, data) => {
    set((state) => ({
      pages: state.pages.map(p =>
        p.id === id
          ? { ...p, data, updatedAt: Date.now() }
          : p
      ),
      currentPage: state.currentPage?.id === id
        ? { ...state.currentPage, data, updatedAt: Date.now() }
        : state.currentPage,
    }));
  },
  
  updatePageThumbnail: (id, thumbnail) => {
    set((state) => ({
      pages: state.pages.map(p =>
        p.id === id
          ? { ...p, thumbnail }
          : p
      ),
      currentPage: state.currentPage?.id === id
        ? { ...state.currentPage, thumbnail }
        : state.currentPage,
    }));
  },
  
  reorderPages: (fromIndex, toIndex) => {
    set((state) => {
      const newPages = [...state.pages];
      const [removed] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, removed);
      return { pages: newPages };
    });
  },
}));