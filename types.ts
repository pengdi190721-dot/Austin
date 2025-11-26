export enum AppMode {
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE',
  WORKFLOW = 'WORKFLOW'
}

export interface GeneratedImage {
  id: string;
  data: string; // base64
  prompt: string;
  timestamp: number;
}

export interface WorkflowNode {
  id: string;
  type: 'input' | 'process' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    value?: string; // For prompts or base64 data
    image?: string; // For display
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}
