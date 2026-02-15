
import { Unit } from './types';

export const UNITS: Unit[] = ['Pcs', 'Dos', 'Kg', 'Zak', 'M', 'M2', 'M3', 'Lbr', 'Btg'];

// PENTING: Ganti string di bawah ini dengan URL Web App dari Google Apps Script yang Anda deploy
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLtCMGX5JUHO2ShKCr2aMYh-mwQ5B-peBcwEMIsBcRKXqMSUdgmTKF3jxvboV3c8wyHA/exec'; 

export const DEFAULT_AVATARS = [
  'https://api.dicebear.com/9.x/micah/svg?seed=Felix',
  'https://api.dicebear.com/9.x/micah/svg?seed=Aneka',
  'https://api.dicebear.com/9.x/micah/svg?seed=Willow',
  'https://api.dicebear.com/9.x/micah/svg?seed=Casper',
  'https://api.dicebear.com/9.x/micah/svg?seed=Sasha',
  'https://api.dicebear.com/9.x/micah/svg?seed=Oliver',
  'https://api.dicebear.com/9.x/micah/svg?seed=Milo',
  'https://api.dicebear.com/9.x/micah/svg?seed=Leo',
  'https://api.dicebear.com/9.x/micah/svg?seed=Nora',
  'https://api.dicebear.com/9.x/micah/svg?seed=Luna',
];

export const INITIAL_CATEGORIES = [
  { id: 'c1', name: 'Persiapan', percentage: 0 },
  { id: 'c2', name: 'Struktur Bawah', percentage: 0 },
  { id: 'c3', name: 'Struktur Atas', percentage: 0 },
  { id: 'c4', name: 'Arsitektur', percentage: 0 },
  { id: 'c5', name: 'MEP', percentage: 0 },
  { id: 'c6', name: 'Finishing', percentage: 0 },
];
