import { TestCase } from "@/types";

export interface TestCaseFormItem {
  id: string;
  name: string;
  httpMethod: string;
  urlTemplate: string;
  expectedStatus: number;
  score: number;
  order: number;
  input?: string;
  expectedBody?: string;
  selector?: string;
  selectorMinCount?: number;
  elementId?: string;
  elementText?: string;
  selectorText?: string;
}

export interface FormQuestionItem {
  id: string;
  title: string;
  type: "0" | "1";
  maxScore: number;
  artifactFolderName: string;
  testCases: TestCaseFormItem[];
  showTestCasesConfig?: boolean;
}
