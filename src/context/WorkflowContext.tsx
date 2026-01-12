import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface WorkflowData {
  // Tech Pack
  designFile?: File;
  measurements: {
    chestWidth: string;
    length: string;
    sleeveLength: string;
  };
  fabric: string;
  gsm: string;
  print: string;
  sizeChart?: any;
  constructionNotes: string;
  
  // Factory Match
  quantity: string;
  leadTime: string;
  location: string;
  priceRange: string;
  minPrice?: string;
  maxPrice?: string;
  selectedFactory?: {
    id: string;
    name: string;
    location: string;
    leadTime: string;
    priceRange: string;
  };
  
  // Production Details
  deliveryDate: string;
  materialSource: 'factory' | 'designer';
  
  // Sample
  fitPhotos?: File[];
  fitNotes: string;
  sampleApproved: boolean;
  sampleRejected: boolean;
  manufacturerSamples: string[]; // URLs to manufacturer uploaded samples
  
  // Production
  labDipsApproved: boolean;
  labDipsRejected: boolean;
  materialsApproved: boolean;
  materialsRejected: boolean;
  materialsList: string;
  firstBatchApproved: boolean;
  firstBatchRejected: boolean;
  productionNotes: string;
  
  // Quality
  qcApproved: boolean;
  qcRejected: boolean;
  
  // Shipping
  trackingNumber: string;
  deliveryConfirmed: boolean;
  invoices: string[]; // URLs to invoices
  
  // Communication
  factoryMessages: Array<{
    id: string;
    sender: 'designer' | 'factory';
    message: string;
    timestamp: Date;
    attachments?: string[];
  }>;
}

interface WorkflowContextType {
  workflowData: WorkflowData;
  updateWorkflowData: (data: Partial<WorkflowData>) => void;
  currentStage: string;
  setCurrentStage: (stage: string, force?: boolean) => void;
  completedStages: string[];
  markStageComplete: (stage: string) => void;
  getProgress: () => number;
  isStageAccessible: (stage: string) => boolean;
  furthestStage: string;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialData: WorkflowData = {
  measurements: { chestWidth: '', length: '', sleeveLength: '' },
  fabric: '',
  gsm: '',
  print: '',
  constructionNotes: '',
  quantity: '',
  leadTime: '',
  location: '',
  priceRange: '',
  deliveryDate: '',
  materialSource: 'factory',
  fitNotes: '',
  sampleApproved: false,
  sampleRejected: false,
  manufacturerSamples: [],
  labDipsApproved: false,
  labDipsRejected: false,
  materialsApproved: false,
  materialsRejected: false,
  materialsList: '',
  firstBatchApproved: false,
  firstBatchRejected: false,
  productionNotes: '',
  qcApproved: false,
  qcRejected: false,
  trackingNumber: '',
  deliveryConfirmed: false,
  invoices: [],
  factoryMessages: [],
};


export const WorkflowProvider = ({ children, initialStage }: { children: ReactNode; initialStage?: string }) => {
  const [searchParams] = useSearchParams();
  const [workflowData, setWorkflowData] = useState<WorkflowData>(initialData);
  const [currentStage, setCurrentStageState] = useState(initialStage || 'upload-tech-pack');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [furthestStage, setFurthestStage] = useState<string>(initialStage || 'upload-tech-pack');

  useEffect(() => {
    console.log('[CTX] currentStage changed →', currentStage);
  }, [currentStage]);

  const stages = [
    // Tech Pack phase - Upload first
    'upload-tech-pack',
    // Tech Pack generator steps
    'design',
    'specifications',
    'fabric-color',
    'tech-pack',
    // Manufacturers phase
    'factory-match',
    'send-tech-pack',
    'waiting',
    'manufacture-selection',
    'tech-pack-feasibility',
    // Production phase
    'production',
    'payment',
    'waiting-sample',
    'sample',
    'production-tracking',
    'quality',
    'shipping',
  ];

  const ensureCompletedUpTo = (stage: string) => {
    const idx = stages.indexOf(stage);
    if (idx <= 0) return;

    const impliedCompleted = stages.slice(0, idx);
    setCompletedStages((prev) => {
      const merged = new Set(prev);
      impliedCompleted.forEach((s) => merged.add(s));
      return Array.from(merged);
    });
  };

  // Sync currentStage with URL parameter
  useEffect(() => {
    const stageFromUrl = searchParams.get('stage');
    if (stageFromUrl && stageFromUrl !== currentStage) {
      console.log('[WorkflowContext] URL stage changed to:', stageFromUrl);
      setCurrentStageState(stageFromUrl);
      ensureCompletedUpTo(stageFromUrl);
    }
  }, [searchParams, currentStage]);

  // Apply initialStage (from workflow route logic) and infer completed stages for progress persistence
  useEffect(() => {
    if (!initialStage) return;
    console.log('[WorkflowContext] Initial stage set to:', initialStage);
    setCurrentStageState(initialStage);
    setFurthestStage(initialStage);
    ensureCompletedUpTo(initialStage);
  }, [initialStage]);

  const isStageAccessible = (stage: string) => {
    const stageIndex = stages.indexOf(stage);
    if (stageIndex === -1) return false;
    if (stageIndex === 0) return true; // First stage always accessible
    
    // Check if previous stage is completed
    const previousStage = stages[stageIndex - 1];
    return completedStages.includes(previousStage);
  };

  const setCurrentStage = (stage: string, force: boolean = false) => {
    const stageIndex = stages.indexOf(stage);
    const currentIndex = stages.indexOf(currentStage);
    
    // Allow navigation if:
    // 1. Force navigation is requested
    // 2. Stage is accessible (previous stage already completed)
    // 3. Stage was already completed (going back)
    // 4. We're navigating to the immediate next stage from current (handles async state updates)
    const isImmediateNext = stageIndex === currentIndex + 1;
    
    if (force || isStageAccessible(stage) || completedStages.includes(stage) || isImmediateNext) {
      setCurrentStageState(stage);
      
      // Update furthest stage if we're advancing
      if (stageIndex > stages.indexOf(furthestStage)) {
        setFurthestStage(stage);
      }
    }
  };

  const updateWorkflowData = (data: Partial<WorkflowData>) => {
    setWorkflowData(prev => ({ ...prev, ...data }));
  };

  const markStageComplete = (stage: string) => {
    if (!completedStages.includes(stage)) {
      setCompletedStages(prev => [...prev, stage]);
    }
  };

  const getProgress = () => {
    const totalStages = stages.length;
    return Math.round((completedStages.length / totalStages) * 100);
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflowData,
        updateWorkflowData,
        currentStage,
        setCurrentStage,
        completedStages,
        markStageComplete,
        getProgress,
        isStageAccessible,
        furthestStage,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};
