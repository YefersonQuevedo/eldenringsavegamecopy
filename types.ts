
export interface SaveGameCharacter {
  id: string; // Unique ID for React key, e.g., slotIndex
  index: number;
  active: boolean;
  characterName: string;
  characterLevel: number;
  secondsPlayed: number;
  rawSlotData: Uint8Array; // SLOT_LENGTH bytes
  rawHeaderData: Uint8Array; // SAVE_HEADER_LENGTH bytes
  parsingIssues?: string[]; // To note any anomalies during parsing
}

export interface ParsedSaveFile {
  fileName: string;
  fileBuffer: ArrayBuffer; // Full file data
  steamId: Uint8Array; // 8-byte SteamID64
  characters: SaveGameCharacter[];
}

export interface FileState {
  data: ParsedSaveFile | null;
  error: string | null;
  isLoading: boolean;
}

// Props for the DataPreviewer component, used in App.tsx state
// Can preview either a specific character or a full file buffer
export interface DataPreviewerPropsForState {
  isOpen: boolean;
  character?: SaveGameCharacter | null; // For character-specific view
  fileName?: string | null; // Associated file name for the character or the full file
  fullFileBuffer?: ArrayBuffer | null; // For full file view
}

// Props for GuideModal
export interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fix: Define and export Language type
export type Language = 'en' | 'es';

// Fix: Define and export Translations interface
export interface Translations {
  [key: string]: string | Translations;
}

// Fix: Define and export LanguageContextType interface
export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  isLoadingTranslations?: boolean; // Optional: if needed by consumers
  translationError?: string | null; // Optional: if needed by consumers
}
