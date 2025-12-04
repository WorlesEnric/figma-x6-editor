const { v4: uuidv4 } = require('uuid');

// Generate default project ID and page ID
const defaultProjectId = uuidv4();
const defaultPageId = uuidv4();

// Sample graph data for demo
const sampleGraphData = {
  nodes: [
    {
      id: uuidv4(),
      shape: 'flowchart-terminator',
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      attrs: {
        label: { text: 'Start' },
      },
    },
    {
      id: uuidv4(),
      shape: 'flowchart-process',
      x: 280,
      y: 200,
      width: 140,
      height: 60,
      attrs: {
        label: { text: 'Process Data' },
      },
    },
    {
      id: uuidv4(),
      shape: 'flowchart-decision',
      x: 300,
      y: 320,
      width: 100,
      height: 80,
      attrs: {
        label: { text: 'Valid?' },
      },
    },
    {
      id: uuidv4(),
      shape: 'flowchart-terminator',
      x: 300,
      y: 460,
      width: 100,
      height: 50,
      attrs: {
        label: { text: 'End' },
      },
    },
  ],
  edges: [],
};

// Create default project
const createDefaultProject = () => ({
  id: defaultProjectId,
  name: 'My First Diagram',
  pages: [
    {
      id: defaultPageId,
      name: 'Main Flow',
      data: sampleGraphData,
      thumbnail: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: uuidv4(),
      name: 'Untitled Page',
      data: null,
      thumbnail: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  currentPageId: defaultPageId,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Initialize store with mock data
const initializeMockData = (store) => {
  const defaultProject = createDefaultProject();
  store.projects.set(defaultProject.id, defaultProject);

  console.log('Mock data initialized:');
  console.log(`  - Default project ID: ${defaultProjectId}`);
  console.log(`  - Default page ID: ${defaultPageId}`);
};

module.exports = {
  defaultProjectId,
  defaultPageId,
  sampleGraphData,
  createDefaultProject,
  initializeMockData,
};