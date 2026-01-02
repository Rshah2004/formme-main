export interface Design {
  id: string;
  name: string;
  stage: 'design' | 'specifications' | 'fabric-color' | 'tech-pack' | 'factory-selection' | 'factory-match' | 'send-tech-pack' | 'waiting' | 'production' | 'payment' | 'sample' | 'quality' | 'shipping';
  status: 'on-track' | 'delayed' | 'action-required' | 'completed';
  nextAction: string;
  eta: string;
  progress: number;
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  minOrder: number;
  leadTime: string;
  priceRange: string;
}

export interface Task {
  id: string;
  designId: string;
  designName: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export const mockDesigns: Design[] = [
  {
    id: '1',
    name: 'Oversized Tee',
    stage: 'sample',
    status: 'action-required',
    nextAction: 'Upload fit photos and approve sample',
    eta: 'Nov 30, 2025',
    progress: 60
  },
  {
    id: '2',
    name: 'Linen Pants',
    stage: 'production',
    status: 'on-track',
    nextAction: 'Review first batch photos',
    eta: 'Dec 15, 2025',
    progress: 75
  },
  {
    id: '3',
    name: 'Knit Tank',
    stage: 'design',
    status: 'action-required',
    nextAction: 'Add size chart and construction notes',
    eta: 'Nov 28, 2025',
    progress: 30
  },
  {
    id: '4',
    name: 'Denim Jacket',
    stage: 'quality',
    status: 'delayed',
    nextAction: 'Review QC report and defect photos',
    eta: 'Dec 20, 2025',
    progress: 85
  },
  {
    id: '5',
    name: 'Silk Blouse',
    stage: 'factory-match',
    status: 'on-track',
    nextAction: 'Select factory from top matches',
    eta: 'Dec 5, 2025',
    progress: 45
  },
  {
    id: '6',
    name: 'Cotton Hoodie',
    stage: 'shipping',
    status: 'completed',
    nextAction: 'Confirm delivery',
    eta: 'Completed',
    progress: 100
  }
];

export const mockFactories: Factory[] = [
  {
    id: 'f1',
    name: 'GreenThread Manufacturing',
    location: 'Portugal',
    score: 95,
    strengths: ['GOTS certified', 'Small batch specialist', 'Fast communication'],
    weaknesses: ['Higher price point'],
    minOrder: 100,
    leadTime: '4-6 weeks',
    priceRange: '$25-$35'
  },
  {
    id: 'f2',
    name: 'EcoFabric Works',
    location: 'India',
    score: 88,
    strengths: ['Organic cotton expert', 'Competitive pricing', 'Large capacity'],
    weaknesses: ['Longer lead times', 'Communication delays'],
    minOrder: 300,
    leadTime: '8-10 weeks',
    priceRange: '$12-$18'
  },
  {
    id: 'f3',
    name: 'Precision Garments Co',
    location: 'Turkey',
    score: 82,
    strengths: ['Technical expertise', 'Quality control', 'Mid-range pricing'],
    weaknesses: ['MOQ can be high'],
    minOrder: 200,
    leadTime: '6-8 weeks',
    priceRange: '$18-$25'
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    designId: '2',
    designName: 'Linen Pants',
    action: 'Approve lab dips for fabric',
    priority: 'high',
    dueDate: 'Nov 25, 2025'
  },
  {
    id: 't2',
    designId: '3',
    designName: 'Knit Tank',
    action: 'Add size chart',
    priority: 'high',
    dueDate: 'Nov 26, 2025'
  },
  {
    id: 't3',
    designId: '4',
    designName: 'Denim Jacket',
    action: 'Answer factory question about button placement',
    priority: 'medium',
    dueDate: 'Nov 27, 2025'
  },
  {
    id: 't4',
    designId: '1',
    designName: 'Oversized Tee',
    action: 'Upload fit photos',
    priority: 'high',
    dueDate: 'Nov 29, 2025'
  }
];

// Designer-friendly stage names
export const stageNames: Record<string, string> = {
  // Overview
  'overview': 'Overview',
  
  // Tech Pack stages
  'design': 'Design Details',
  'specifications': 'Specifications', 
  'fabric-color': 'Fabric & Color',
  'tech-pack': 'Tech Pack',
  
  // Manufacturers stages
  'factory-selection': 'Find a Maker',
  'factory-match': 'Find Manufacturers',
  'send-tech-pack': 'Maker Response',
  'waiting': 'Waiting for Response',
  'manufacture-selection': 'Finalize Manufacturer',
  
  // Production stages
  'production': 'Review Details',
  'payment': 'Payment',
  'sample': 'Sample Review',
  'quality': 'Quality Check',
  'shipping': 'Delivery'
};

// Full stage order for workflow
export const stageOrder = [
  // Overview
  'overview',
  // Tech Pack phase
  'design',
  'specifications',
  'fabric-color',
  'tech-pack',
  // Manufacturers phase
  'factory-match',
  'manufacture-selection',
  'send-tech-pack',
  'waiting',
  // Production phase
  'payment',
  'sample',
  'quality',
  'shipping'
] as const;

// Legacy mapping for backward compatibility
export const legacyStageMapping: Record<string, string> = {
  'tech-pack': 'design', // Old tech-pack stage now maps to design
};
