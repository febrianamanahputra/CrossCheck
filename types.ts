
export type Unit = 'Pcs' | 'Dos' | 'Kg' | 'Zak' | 'M' | 'M2' | 'M3' | 'Lbr' | 'Btg';

export interface MaterialItem {
  id: string;
  name: string;
  qty: number;
  unit: Unit;
  icon?: string; // Nama icon untuk kustomisasi
}

export interface RequestItem {
  id: string;
  name: string;
  qty: number;
  unit: Unit;
  date: string;
  status: 'pending' | 'done';
}

export interface WorkItem {
  id: string;
  text: string;
  photos?: string[]; // Foto spesifik per item
}

export interface DailyReport {
  plan: WorkItem[];
  progress: WorkItem[];
  photos: string[]; // Legacy global photos (bisa dibiarkan atau diabaikan)
}

export interface ProgressData {
  manpower: number;
  weather: string;
  categories: {
    id: string;
    name: string;
    percentage: number;
  }[];
}

export interface ExpenseItem {
  id: string;
  date: string;
  item: string;
  unit: Unit;
  price: number;
  total: number;
}

export interface FundLog {
  id: string;
  number: string;
  receiptPhoto?: string; // Foto bukti nota total
  items: ExpenseItem[];
}

export interface QuickLink {
  id: string;
  name: string;
  url: string;
}

export interface LocationData {
  id: string;
  name: string;
  inventory: MaterialItem[];
  requests: RequestItem[]; // New field for tracking requests
  report: DailyReport;
  projectProgress: ProgressData;
  funds: FundLog[];
}

export type Tab = 'report' | 'note' | 'progress' | 'dana' | 'profile';

export interface AppState {
  currentLocationId: string;
  locations: Record<string, LocationData>;
  userAvatar: string;
  userName: string;
  quickNotes: string[];
  quickLinks: QuickLink[];
  managedProjectsCount: number;
}