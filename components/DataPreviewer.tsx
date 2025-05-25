import React, { useMemo } from 'react';
import type { SaveGameCharacter } from '../types';
import { CloseIcon, AlertTriangleIcon } from './Icons';

interface DataPreviewerProps {
  isOpen: boolean;
  onClose: () => void;
  character?: SaveGameCharacter | null; 
  fileName?: string | null; 
  fullFileBuffer?: ArrayBuffer | null; 
}

const BYTES_PER_LINE = 16;
const MAX_FULL_FILE_BYTES_TO_DISPLAY = 1024; 
const MAX_SLOT_DATA_BYTES_TO_DISPLAY = 256;

const formatHex = (byte: number) => byte.toString(16).padStart(2, '0').toUpperCase();
const formatAscii = (byte: number) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');

const DataViewSection: React.FC<{ title: string, data: Uint8Array | null, totalLength?: number, isPartial?: boolean, bytesDisplayed?: number }> = 
  ({ title, data, totalLength, isPartial, bytesDisplayed }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mt-3">
        <h4 className="text-xl font-semibold text-yellow-400 mb-2 font-cinzel">{title}</h4>
        <div className="bg-slate-700 p-4 rounded-md">
         <p className="text-slate-400">No data available or data is empty for this section.</p>
        </div>
      </div>
    );
  }

  const lines = [];
  const currentDisplayLength = bytesDisplayed || data.length;
  for (let i = 0; i < currentDisplayLength; i += BYTES_PER_LINE) {
    const slice = data.subarray(i, Math.min(i + BYTES_PER_LINE, currentDisplayLength));
    const offset = i.toString(16).padStart(8, '0').toUpperCase();
    const hexBytes = Array.from(slice).map(formatHex).join(' ');
    const asciiChars = Array.from(slice).map(formatAscii).join('');
    lines.push({ offset, hexBytes, asciiChars });
  }

  let bytesShownText = `(${currentDisplayLength} bytes shown)`;
  if (isPartial && totalLength && totalLength > currentDisplayLength) {
    bytesShownText = `(${currentDisplayLength} bytes shown of ${totalLength} total)`;
  } else if (totalLength) {
     bytesShownText = `(${currentDisplayLength} bytes shown of ${totalLength} total)`;
  }


  return (
    <div className="mt-3">
      <h4 className="text-xl font-semibold text-yellow-400 mb-2 font-cinzel">
        {title} 
        <span className="text-sm text-slate-400 ml-2">
            {bytesShownText}
        </span>
      </h4>
      <div className="bg-slate-900 p-3 rounded-md overflow-x-auto max-h-64 font-mono text-xs border border-slate-700 shadow-inner">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pr-4 py-1">Offset</th>
              <th className="pr-4 py-1">Hexadecimal</th>
              <th className="py-1">ASCII</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="text-slate-300 hover:bg-slate-700/50">
                <td className="pr-4 py-0.5">{line.offset}</td>
                <td className="pr-4 whitespace-nowrap py-0.5">{line.hexBytes.padEnd(BYTES_PER_LINE * 3 - 1, ' ')}</td>
                <td className="whitespace-nowrap py-0.5">{line.asciiChars}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isPartial && currentDisplayLength < (totalLength || 0) && (
         <p className="text-xs text-slate-500 mt-1.5">{`Showing the first ${currentDisplayLength} bytes. Full section size: ${totalLength} bytes.`}</p>
      )}
    </div>
  );
};


export const DataPreviewer: React.FC<DataPreviewerProps> = ({ isOpen, onClose, character, fileName, fullFileBuffer }) => {
  if (!isOpen) { 
    return null;
  }

  const isFullFileView = !!fullFileBuffer && !character;
  let previewTitleContent = "Data Preview";
  let fileDetailsContent = `File: ${fileName || 'N/A'}`;

  if (isFullFileView) {
    previewTitleContent = `File Content: ${fileName || "File Preview"}`;
  } else if (character) {
    previewTitleContent = `Character: ${character.characterName}`;
    fileDetailsContent = `Slot ${character.index + 1} from ${fileName || 'N/A'}`;
  }


  const displayedFullFileData = useMemo(() => {
    if (isFullFileView && fullFileBuffer) {
      return new Uint8Array(fullFileBuffer.slice(0, MAX_FULL_FILE_BYTES_TO_DISPLAY));
    }
    return null;
  }, [isFullFileView, fullFileBuffer]);
  
  const displayedSlotData = useMemo(() => {
    if (!isFullFileView && character?.rawSlotData) {
      return character.rawSlotData.subarray(0, MAX_SLOT_DATA_BYTES_TO_DISPLAY);
    }
    return null;
  }, [isFullFileView, character]);

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-previewer-title"
    >
      <div 
        className="bg-slate-800 p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
          <h3 id="data-previewer-title" className="text-2xl sm:text-3xl font-bold text-yellow-400 font-cinzel tracking-wide">
            {previewTitleContent}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-teal-400 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Close Preview"
          >
            <CloseIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-2">{fileDetailsContent}</p>
        
        {character && !isFullFileView && (
          <div className="mb-3 text-sm">
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${character.active ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`}>
              {character.active ? "Status: Active" : "Status: Inactive"}
            </span>
            {character.parsingIssues && character.parsingIssues.length > 0 && (
                <div className="mt-2 p-2.5 bg-amber-600 bg-opacity-30 rounded-md border border-amber-500">
                    <p className="text-xs text-amber-300 font-semibold flex items-center">
                      <AlertTriangleIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0"/>
                      Parsing Issues Noted:
                    </p>
                    <ul className="list-disc list-inside text-xs text-amber-400 pl-3 mt-1">
                        {character.parsingIssues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                    </ul>
                </div>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-grow pr-2 -mr-2 custom-scrollbar">
            {isFullFileView && displayedFullFileData && (
              <DataViewSection 
                title="File Content"
                data={displayedFullFileData} 
                totalLength={fullFileBuffer?.byteLength}
                isPartial={fullFileBuffer!.byteLength > MAX_FULL_FILE_BYTES_TO_DISPLAY}
                bytesDisplayed={MAX_FULL_FILE_BYTES_TO_DISPLAY}
              />
            )}
            {!isFullFileView && character && (
              <>
                <DataViewSection 
                    title="Header Data"
                    data={character.rawHeaderData} 
                    totalLength={character.rawHeaderData.length} 
                    bytesDisplayed={character.rawHeaderData.length}
                />
                <DataViewSection 
                    title="Slot Data"
                    data={displayedSlotData}
                    totalLength={character.rawSlotData?.length}
                    isPartial={character.rawSlotData && character.rawSlotData.length > MAX_SLOT_DATA_BYTES_TO_DISPLAY }
                    bytesDisplayed={MAX_SLOT_DATA_BYTES_TO_DISPLAY}
                />
              </>
            )}
            {(!character && !fullFileBuffer) && (
                <p className="text-slate-500 text-center py-10">No data selected for preview.</p>
            )}
        </div>

        <div className="mt-6 text-right pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};