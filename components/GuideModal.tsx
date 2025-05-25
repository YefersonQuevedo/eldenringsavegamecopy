import React from 'react';
import { CloseIcon } from './Icons';
import type { GuideModalProps } from '../types';


const GuideStep: React.FC<{ title: string, body: string }> = ({ title, body }) => {
    return (
        <div className="mb-4">
            <h4 className="text-lg font-semibold text-teal-400 mb-1">{title}</h4>
            <p className="text-slate-300 text-sm">{body}</p>
        </div>
    );
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div
        className="bg-slate-800 p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
          <h3 id="guide-modal-title" className="text-2xl sm:text-3xl font-bold text-yellow-400 font-cinzel tracking-wide">
            How to Use Elden Ring Save Utility
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-teal-400 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Close Preview"
          >
            <CloseIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 -mr-2 custom-scrollbar">
          <GuideStep title="1. Select Source File" body="Click 'Choose file' under 'Source File'. Pick your Elden Ring save file (usually ER0000.sl2 or .co2) that has the character you want to copy." />
          <GuideStep title="2. Pick Source Character" body="Once the source file loads, a list of characters will appear. Click on the character you wish to copy. It must be an 'Active' character." />
          <GuideStep title="3. Select Target File" body="Click 'Choose file' under 'Target File'. Select the Elden Ring save file where you want to copy the character to. This can be the same file or a different one." />
          <GuideStep title="4. Pick Target Slot" body="A list of slots will appear for the target file. Click on the slot where you want to place the copied character. This can be an 'Empty Slot' or an existing character you want to overwrite (be careful!)." />
          <GuideStep title="5. Copy Character" body="Click the 'Copy Character' button. If successful, a new save file (e.g., ER0000_modded_timestamp.sl2) will be downloaded by your browser." />
          <GuideStep title="6. Use the New File" body="IMPORTANT: Backup your original save file from your game's save directory. Then, replace it with the downloaded file (you might need to rename the downloaded file to ER0000.sl2 or ER0000.co2 depending on your game setup)." />
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h4 className="text-lg font-semibold text-yellow-500 mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                <li>ALWAYS backup your original save files before using this tool or replacing files in your game directory.</li>
                <li>Using modded save files (.co2) or transferring characters between extensively modded and unmodded games can have unpredictable results and MAY CARRY RISKS for online play. Use with extreme caution and at your own risk.</li>
                <li>The tool automatically attempts to adjust SteamIDs within the character data to match the target file's SteamID.</li>
                <li>Checksums for the character slot and save headers are automatically recalculated.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-right pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};