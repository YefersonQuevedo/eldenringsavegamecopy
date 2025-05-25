import React, { useState, useCallback } from 'react';
import type { ParsedSaveFile, SaveGameCharacter, FileState, DataPreviewerPropsForState } from './types';
import { FileSelector } from './components/FileSelector';
import { DataPreviewer } from './components/DataPreviewer';
import { GuideModal } from './components/GuideModal';
import { generateModifiedSaveFile, parseSaveFile } from './services/eldenRingSaveManager';
import { ArrowRightIcon, CopyIcon, DownloadIcon, AlertTriangleIcon, HelpCircleIcon } from './components/Icons';

const initialFileState: FileState = { data: null, error: null, isLoading: false };

const initialPreviewState: DataPreviewerPropsForState = { 
  isOpen: false, 
  character: null, 
  fileName: null,
  fullFileBuffer: null
};


const App: React.FC = () => {
  const [sourceFileState, setSourceFileState] = useState<FileState>(initialFileState);
  const [targetFileState, setTargetFileState] = useState<FileState>(initialFileState);
  const [selectedSourceChar, setSelectedSourceChar] = useState<SaveGameCharacter | null>(null);
  const [selectedTargetSlot, setSelectedTargetSlot] = useState<SaveGameCharacter | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<DataPreviewerPropsForState>(initialPreviewState);
  const [isGuideOpen, setIsGuideOpen] = useState(false);


  const handleSourceFileLoad = useCallback((parsedFile: ParsedSaveFile) => {
    setSourceFileState({ data: parsedFile, error: null, isLoading: false });
    setSelectedSourceChar(null);
    setCopySuccessMessage(null);
    setCopyError(null);
  }, []);

  const handleSourceFileError = useCallback((error: string) => {
    setSourceFileState({ data: null, error, isLoading: false });
  }, []);
  
  const handleSourceFileLoading = useCallback(() => {
    setSourceFileState(prev => ({ ...prev, isLoading: true, error: null }));
  }, []);

  const handleTargetFileLoad = useCallback((parsedFile: ParsedSaveFile) => {
    setTargetFileState({ data: parsedFile, error: null, isLoading: false });
    setSelectedTargetSlot(null);
    setCopySuccessMessage(null);
    setCopyError(null);
  }, []);

  const handleTargetFileError = useCallback((error: string) => {
    setTargetFileState({ data: null, error, isLoading: false });
  }, []);

  const handleTargetFileLoading = useCallback(() => {
    setTargetFileState(prev => ({ ...prev, isLoading: true, error: null }));
  }, []);

  const handleOpenCharacterPreview = useCallback((character: SaveGameCharacter, fileName: string) => {
    setPreviewState({ 
      isOpen: true, 
      character, 
      fileName,
      fullFileBuffer: null 
    });
  }, []);
  
  const handleOpenFullFilePreview = useCallback((fileData: ParsedSaveFile) => {
    setPreviewState({
      isOpen: true,
      character: null, 
      fileName: fileData.fileName,
      fullFileBuffer: fileData.fileBuffer
    });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewState(initialPreviewState);
  }, []);


  const handleCopy = async () => {
    if (!selectedSourceChar || !selectedTargetSlot || !sourceFileState.data || !targetFileState.data) {
      setCopyError("Source character, target slot, and both files must be selected/loaded.");
      return;
    }
    setIsCopying(true);
    setCopyError(null);
    setCopySuccessMessage(null);

    try {
      const modifiedFileBuffer = generateModifiedSaveFile(
        selectedSourceChar,
        selectedTargetSlot.index, 
        sourceFileState.data,
        targetFileState.data
      );
      
      const blob = new Blob([modifiedFileBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const originalFileName = targetFileState.data.fileName.replace(/\.(sl2|co2)$/, '');
      const extension = targetFileState.data.fileName.split('.').pop() || 'sl2';
      const downloadName = `${originalFileName}_modded_${timestamp}.${extension}`;
      a.download = downloadName; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCopySuccessMessage(`${downloadName} has been prepared. Remember to backup your original saves.`);
      
      const newParsedTarget = parseSaveFile(targetFileState.data.fileName, modifiedFileBuffer); 
      setTargetFileState({ data: newParsedTarget, error: null, isLoading: false });
      setSelectedTargetSlot(null); 

    } catch (error) {
      console.error("Error during copy operation:", error);
      setCopyError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCopying(false);
    }
  };
  
  const canCopy = selectedSourceChar && selectedTargetSlot && sourceFileState.data && targetFileState.data && !isCopying;

  const themedBg = "https://images.unsplash.com/photo-1580327344181-c1163965e7a0?auto=format&fit=crop&w=1920&q=80&blur=5";


  return (
    <div 
      className="min-h-screen bg-slate-900 bg-cover bg-center bg-fixed text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 selection:bg-teal-500 selection:text-white"
      style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('${themedBg}')` }}
    >
      <div className="bg-slate-800 bg-opacity-80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-6xl">
        <header className="mb-10">
          <div className="flex justify-end items-center mb-4"> {/* Removed LanguageSwitcher, adjusted layout */}
            <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center text-sm text-teal-400 hover:text-teal-300 hover:underline focus:outline-none focus:ring-1 focus:ring-teal-500 rounded p-1.5 bg-slate-700 hover:bg-slate-600 transition-colors"
                title="How to Use"
            >
                <HelpCircleIcon className="w-5 h-5 mr-1.5"/> How to Use
            </button>
          </div>
          <div className="text-center">
            <div className="w-28 h-28 mx-auto mb-4 rounded-full border-2 border-yellow-500 flex items-center justify-center bg-slate-700 shadow-lg">
                <span className="text-5xl text-yellow-400 font-cinzel">ER</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 tracking-wider font-cinzel">Elden Ring Save Utility</h1>
            <p className="text-slate-300 mt-3 text-base sm:text-lg">Transfer character data between save files. Use with caution.</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row justify-around items-start gap-6 xl:gap-8 mb-8">
          <FileSelector
            id="sourceFile"
            label="Source File"
            fileState={sourceFileState}
            onFileLoad={handleSourceFileLoad}
            onFileError={handleSourceFileError}
            onFileLoading={handleSourceFileLoading}
            selectedCharacterId={selectedSourceChar?.id || null}
            onCharacterSelect={(char) => char && char.active ? setSelectedSourceChar(char) : setSelectedSourceChar(null)}
            onInspectCharacter={(char) => handleOpenCharacterPreview(char, sourceFileState.data?.fileName || "Source File")}
            onInspectFile={handleOpenFullFilePreview}
            highlightColorConfig={{
              selectedBg: "bg-sky-700",
              selectedRing: "ring-sky-500",
              selectedText: "text-sky-100"
            }}
          />
          <div className="flex items-center justify-center lg:mt-40 text-yellow-400 self-center py-4 lg:py-0">
            <ArrowRightIcon className="w-10 h-10 md:w-12 md:h-12 transform transition-transform hover:scale-110"/>
          </div>
          <FileSelector
            id="targetFile"
            label="Target File"
            fileState={targetFileState}
            onFileLoad={handleTargetFileLoad}
            onFileError={handleTargetFileError}
            onFileLoading={handleTargetFileLoading}
            selectedCharacterId={selectedTargetSlot?.id || null}
            onCharacterSelect={setSelectedTargetSlot} 
            onInspectCharacter={(char) => handleOpenCharacterPreview(char, targetFileState.data?.fileName || "Target File")}
            onInspectFile={handleOpenFullFilePreview}
            highlightColorConfig={{
              selectedBg: "bg-emerald-700", 
              selectedRing: "ring-emerald-500",
              selectedText: "text-emerald-100"
            }}
          />
        </div>
        
        {copyError && (
          <div className="my-6 p-4 bg-red-700 bg-opacity-60 text-red-100 rounded-lg flex items-start shadow-lg border border-red-600">
            <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-300 flex-shrink-0 mt-1" title="Copy Operation Failed"/>
            <div>
                <h4 className="font-semibold text-lg">Copy Operation Failed</h4>
                <p className="text-sm">{copyError}</p>
            </div>
          </div>
        )}
        {copySuccessMessage && (
          <div className="my-6 p-4 bg-green-700 bg-opacity-60 text-green-100 rounded-lg flex items-start shadow-lg border border-green-600">
            <DownloadIcon className="w-6 h-6 mr-3 text-green-300 flex-shrink-0 mt-1" title="Success!"/>
             <div>
                <h4 className="font-semibold text-lg">Success!</h4>
                <p className="text-sm">{copySuccessMessage}</p>
            </div>
          </div>
        )}

        <div className="text-center mt-10 mb-6">
          <button
            onClick={handleCopy}
            disabled={!canCopy}
            className={`px-10 py-4 text-xl font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-4
              ${canCopy ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-teal-400' 
                         : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70 focus:ring-slate-500'}`}
            aria-live="polite"
          >
            {isCopying ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Copying Character...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CopyIcon className="w-6 h-6 mr-2.5"/>
                Copy Character
              </div>
            )}
          </button>
        </div>
        
        {targetFileState.data && (
             <div className="text-center mt-6">
                <button
                    onClick={() => {
                        if (!targetFileState.data) return;
                        const blob = new Blob([targetFileState.data.fileBuffer], { type: 'application/octet-stream' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        const originalFileName = targetFileState.data.fileName.replace(/\.(sl2|co2)$/, '');
                        const extension = targetFileState.data.fileName.split('.').pop() || 'sl2';
                        const downloadName = `${originalFileName}_backup_${timestamp}.${extension}`;
                        a.href = url;
                        a.download = downloadName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        const backupMsg = `Manual backup ${downloadName} prepared.`;
                        setCopySuccessMessage((prev) => {
                           return prev ? `${prev} Also, manual backup ${downloadName} prepared.` : backupMsg;
                        });
                    }}
                    className="text-sm text-teal-400 hover:text-teal-300 hover:underline focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
                >
                    Download backup of current target file
                </button>
            </div>
        )}
        
        <DataPreviewer 
            isOpen={previewState.isOpen}
            onClose={handleClosePreview}
            character={previewState.character}
            fileName={previewState.fileName}
            fullFileBuffer={previewState.fullFileBuffer}
        />
         <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

        <footer className="text-center mt-12 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-1">This tool modifies save game files. Always backup your original saves before use.</p>
          <p className="text-xs text-slate-400 mb-1">Intended for Elden Ring (ER0000.sl2 files). Use with .co2 or other modded files at your own risk.</p>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Elden Ring Save Utility. Not affiliated with FromSoftware or Bandai Namco.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;