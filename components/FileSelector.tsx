import React from 'react';
import type { ParsedSaveFile, SaveGameCharacter, FileState } from '../types';
import { parseSaveFile } from '../services/eldenRingSaveManager';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, InspectIcon } from './Icons';

interface HighlightColorConfig {
  selectedBg: string;
  selectedRing: string;
  selectedText: string;
}
interface FileSelectorProps {
  id: string;
  label: string; // This will be a static English string passed from App.tsx
  fileState: FileState;
  onFileLoad: (parsedFile: ParsedSaveFile) => void;
  onFileError: (error: string) => void;
  onFileLoading: () => void;
  selectedCharacterId: string | null;
  onCharacterSelect: (character: SaveGameCharacter | null) => void;
  onInspectCharacter: (character: SaveGameCharacter) => void;
  onInspectFile: (fileData: ParsedSaveFile) => void;
  highlightColorConfig: HighlightColorConfig;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  id,
  label,
  fileState,
  onFileLoad,
  onFileError,
  onFileLoading,
  selectedCharacterId,
  onCharacterSelect,
  onInspectCharacter,
  onInspectFile,
  highlightColorConfig,
}) => {

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileLoading();
      try {
        const buffer = await file.arrayBuffer();
        const parsed = parseSaveFile(file.name, buffer); // No longer pass t
        onFileLoad(parsed);
      } catch (error) {
        console.error("Error parsing file:", error);
        let errorMessage = "Failed to parse file. It might be corrupted, not a valid Elden Ring save, or an unsupported modded format. ";
        errorMessage += error instanceof Error ? error.message : String(error);
        onFileError(errorMessage);
      }
    }
    event.target.value = ''; 
  };

  const formatPlaytime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isCo2File = fileState.data?.fileName?.toLowerCase().endsWith('.co2');

  return (
    <div className="bg-slate-800 bg-opacity-90 p-5 sm:p-6 rounded-xl shadow-xl w-full lg:w-[45%] flex flex-col space-y-4 border border-slate-700">
      <h2 className="text-3xl font-semibold text-yellow-400 mb-1 font-cinzel tracking-wide">{label}</h2>
      <div className="flex items-center space-x-3">
        <label htmlFor={id} className="w-full">
          <span className="sr-only">Choose file</span>
          <input
            type="file"
            id={id}
            accept=".sl2,.co2,*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-600 cursor-pointer transition-colors file:transition-colors"
            aria-label={`Select ${label} file. Accepts .sl2, .co2 and other save formats.`}
          />
        </label>
      </div>
      {fileState.isLoading && <Spinner />}
      
      {isCo2File && fileState.data && (
        <div className="p-3 bg-amber-600 bg-opacity-70 rounded-md text-amber-100 text-sm flex items-start border border-amber-500">
          <AlertTriangleIcon className="w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0 text-amber-300" title="Modded File Detected (.co2)" />
          <div>
             <p className="font-semibold">Modded File Detected (.co2)</p>
             <p className="text-xs">Copying data from/to modded files, especially involving unmodded games, carries a risk of unexpected behavior or online play restrictions. Proceed with caution and at your own risk.</p>
          </div>
        </div>
      )}

      {fileState.error && !isCo2File && ( 
        <div className="p-3 bg-red-700 bg-opacity-60 rounded-md text-red-100 text-sm flex items-start border border-red-600">
          <AlertTriangleIcon className="w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0 text-red-300" title="File Selection Issue:" />
          <div>
             <p className="font-semibold">File Selection Issue:</p>
             <p className="text-xs">{fileState.error}</p>
          </div>
        </div>
      )}
      
      {fileState.data && (
        <>
          <div className="flex justify-between items-center pt-2">
            <p className="text-xs text-slate-400 truncate" title={`Loaded: ${fileState.data.fileName}`}>
              Loaded: <span className="font-medium text-slate-300">{fileState.data.fileName}</span>
            </p>
            <button
              onClick={() => onInspectFile(fileState.data!)}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-teal-400 transition-colors"
              title={`Inspect raw data for file ${fileState.data.fileName}`}
              aria-label={`Inspect raw data for file ${fileState.data.fileName}`}
            >
              <InspectIcon className="w-4 h-4" title="Inspect full file"/>
            </button>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1.5 pt-1 pb-1" role="listbox" aria-label={`${label} character slots`}>
            {fileState.data.characters.map((char) => {
              const charNameOrSlot = char.characterName || `Character ${char.index + 1} (Name Appears Empty)`;
              const ariaLabelSelect = `Select character ${charNameOrSlot}${char.active ? '' : ` (Inactive)`}`;
              return (
              <div key={char.id} className="flex items-center space-x-2">
                <button
                  onClick={() => onCharacterSelect(char)}
                  className={`flex-grow text-left p-3 rounded-lg transition-all duration-150 ease-in-out border
                    ${selectedCharacterId === char.id 
                      ? `${highlightColorConfig.selectedBg} ${highlightColorConfig.selectedRing} ring-2 shadow-lg border-transparent` 
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'}
                    ${!char.active && label === "Source File" ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!char.active && label === "Source File"}
                  aria-label={ariaLabelSelect}
                  aria-selected={selectedCharacterId === char.id}
                  role="option"
                >
                  <div className="flex justify-between items-center">
                    <p className={`font-medium text-base ${selectedCharacterId === char.id ? highlightColorConfig.selectedText : 'text-slate-100'}`}>
                      {charNameOrSlot}
                      {char.parsingIssues && char.parsingIssues.length > 0 && (
                        <AlertTriangleIcon 
                          className="w-4 h-4 inline-block ml-2 text-yellow-500" 
                          title={`Parsing Issues:\n${char.parsingIssues.join('\n')}`} />
                      )}
                    </p>
                  </div>

                  {char.active && (
                    <p className={`text-xs mt-0.5 ${selectedCharacterId === char.id ? 'text-opacity-80 '+highlightColorConfig.selectedText : 'text-slate-400'}`}>
                      Level: {char.characterLevel} | Playtime: {formatPlaytime(char.secondsPlayed)}
                    </p>
                  )}
                  {!char.active && label === "Target File" && (
                     <p className="text-xs text-slate-500 italic">(Empty Slot - Available for copy)</p>
                  )}
                   {!char.active && label === "Source File" && (
                     <p className="text-xs text-slate-500 italic">(Inactive - Cannot be source)</p>
                  )}
                </button>
                <button
                  onClick={() => onInspectCharacter(char)}
                  className="p-2.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-300 hover:text-teal-400 transition-colors flex-shrink-0 border border-slate-500 hover:border-teal-500"
                  title={`Inspect raw data for ${charNameOrSlot}`}
                  aria-label={`Inspect raw data for ${charNameOrSlot}`}
                >
                  <InspectIcon className="w-5 h-5" title={`Inspect character ${charNameOrSlot}`}/>
                </button>
              </div>
            );
            })}
          </div>
        </>
      )}
       {!fileState.data && !fileState.isLoading && !fileState.error && (
        <div className="text-center py-10">
            <p className="text-slate-500">Select a save file to begin.</p>
        </div>
       )}
    </div>
  );
};