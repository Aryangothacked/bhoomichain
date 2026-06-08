export interface Block {
  blockNumber: number;
  hash: string;
  prevHash: string;
  timestamp: string;
  data: PropertyData;
}

export interface PropertyData {
  propertyId: string;
  ownerName: string;
  aadhaarLast4: string;
  pan: string;
  surveyNo: string;
  khasraNo: string;
  area: number;
  circleRate: number;
  declaredValue: number;
  gpsLat: number;
  gpsLng: number;
  city: string;
  propertyType: "residential" | "commercial" | "agricultural";
  eventType: "REGISTRATION" | "SALE" | "MUTATION" | "INHERITANCE" | "LIEN" | "COURT_FREEZE";
  status: "CLEAR" | "DISPUTED" | "UNDER_LIEN" | "FROZEN" | "COURT_FREEZE";
  notes: string;
  newOwner: string;
  stampDuty: number;
  registrationFee: number;
}

export interface FraudAnalysis {
  riskScore: number;
  redFlags: string[];
  recommendation: "APPROVE" | "FLAG" | "REJECT";
  lawSections: { section: string; description: string }[];
  summary: string;
  error?: string; // Sometimes the AI API might fail
}

export interface DashboardStats {
  totalProperties: number;
  transactionsToday: number;
  fraudAlertsTotal: number;
  stampDutyCollected: number;
  registrationsByCity: Record<string, number>;
  recentTransactions: Block[];
  cityNodeStatus: Record<string, string>;
  chainValid: boolean;
  chainLength: number;
}
