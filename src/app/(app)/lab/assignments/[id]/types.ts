import type { LabAssignmentDto } from "@/types";

export interface LabWizardContextValue {
  assignmentId: string;
  assignment: LabAssignmentDto | null;
  setAssignment: (a: LabAssignmentDto) => void;
  loading: boolean;
  error: string | null;
  currentStep: number;
  direction: number;
  setCurrentStep: (step: number) => void;
  setDirection: (dir: number) => void;
  goToStep: (step: number, direction: number) => void;
  reloadAssignment: () => Promise<void>;
  registerStepSave: (
    step: number,
    handler: (() => Promise<boolean>) | null
  ) => void;
  runStepSave: (step: number) => Promise<boolean>;
}
