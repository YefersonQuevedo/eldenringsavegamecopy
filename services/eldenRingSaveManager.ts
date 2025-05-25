import { ParsedSaveFile, SaveGameCharacter } from '../types';
import * as C from '../constants';
import { bytesToUtf16LeString, bytesToInt32LE, replaceAllInUint8Array, calculateMd5 } from '../utils/bytes';

export function parseSaveFile(
  fileName: string, 
  fileBuffer: ArrayBuffer
): ParsedSaveFile {
  const dataView = new Uint8Array(fileBuffer);

  // Extract SteamID
  const steamId = dataView.slice(C.STEAM_ID_OFFSET_IN_FILE, C.STEAM_ID_OFFSET_IN_FILE + C.STEAM_ID_LENGTH);

  const characters: SaveGameCharacter[] = [];
  for (let i = 0; i < C.MAX_SLOTS; i++) {
    const parsingIssues: string[] = [];
    // Active status for this slot
    const isActiveByte = dataView[C.CHAR_ACTIVE_STATUS_START_OFFSET + i];
    const active = isActiveByte === 0x01;

    // Character specific header data for this slot
    const charHeaderStartIndex = C.getCharHeaderStartIndexInFile(i);
    const charHeaderEndIndex = charHeaderStartIndex + C.SAVE_HEADER_LENGTH;
    const rawHeaderData = dataView.slice(charHeaderStartIndex, charHeaderEndIndex);
    
    let characterName = `Character ${i + 1} (Name Appears Empty)`;
    let characterLevel = 0;
    let secondsPlayed = 0;

    if (active) {
      try {
        const nameBytes = rawHeaderData.slice(C.CHAR_NAME_OFFSET_IN_HEADER, C.CHAR_NAME_OFFSET_IN_HEADER + C.CHAR_NAME_MAX_BYTES);
        const parsedName = bytesToUtf16LeString(nameBytes).trim();
        
        if (!parsedName) {
          parsingIssues.push("Character name is empty or unreadable.");
        } else {
          characterName = parsedName;
        }
        
        characterLevel = rawHeaderData[C.CHAR_LEVEL_OFFSET_IN_HEADER];
        if (characterLevel === 0 && parsedName) { 
            parsingIssues.push("Character level is 0.");
        }
        
        const playedSecondsBytes = rawHeaderData.slice(C.CHAR_PLAYED_SECONDS_OFFSET_IN_HEADER, C.CHAR_PLAYED_SECONDS_OFFSET_IN_HEADER + 4);
        secondsPlayed = bytesToInt32LE(playedSecondsBytes);

      } catch (e) {
        console.error(`Error parsing active character in slot ${i}:`, e);
        characterName = `Error Parsing Slot ${i + 1}`;
        const errorMessage = e instanceof Error ? e.message : String(e);
        parsingIssues.push(`Parsing error: ${errorMessage}`);
      }
    }
    
    // Raw slot data for this character
    const slotDataStartIndex = C.getSlotDataStartIndex(i);
    const slotDataEndIndex = slotDataStartIndex + C.SLOT_LENGTH;
    const rawSlotData = dataView.slice(slotDataStartIndex, slotDataEndIndex);

    characters.push({
      id: `slot-${i}`,
      index: i,
      active,
      characterName,
      characterLevel,
      secondsPlayed,
      rawSlotData,
      rawHeaderData,
      parsingIssues: parsingIssues.length > 0 ? parsingIssues : undefined,
    });
  }

  return {
    fileName,
    fileBuffer,
    steamId,
    characters,
  };
}

export function generateModifiedSaveFile(
  sourceChar: SaveGameCharacter,
  targetSlotIndex: number,
  sourceFile: ParsedSaveFile,
  targetFile: ParsedSaveFile
): ArrayBuffer {
  // Create a mutable copy of the target file's data
  const newFileBytes = new Uint8Array(targetFile.fileBuffer.slice(0)); 

  const modifiedSourceSlotData = replaceAllInUint8Array(
    sourceChar.rawSlotData,
    sourceFile.steamId,
    targetFile.steamId
  );

  const targetSlotDataStartIndex = C.getSlotDataStartIndex(targetSlotIndex);
  newFileBytes.set(modifiedSourceSlotData, targetSlotDataStartIndex);

  const targetCharHeaderStartIndex = C.getCharHeaderStartIndexInFile(targetSlotIndex);
  newFileBytes.set(sourceChar.rawHeaderData, targetCharHeaderStartIndex);
  
  newFileBytes[C.CHAR_ACTIVE_STATUS_START_OFFSET + targetSlotIndex] = 0x01;

  const newSlotChecksum = calculateMd5(modifiedSourceSlotData);
  const targetSlotChecksumStartIndex = C.getSlotChecksumStartIndex(targetSlotIndex);
  newFileBytes.set(newSlotChecksum, targetSlotChecksumStartIndex);
  
  const headersSectionForChecksum = newFileBytes.slice(
    C.ACTUAL_SAVE_HEADERS_SECTION_START_OFFSET, 
    C.ACTUAL_SAVE_HEADERS_SECTION_START_OFFSET + C.SAVE_HEADERS_SECTION_LENGTH
  );
  const newHeadersSectionChecksum = calculateMd5(headersSectionForChecksum);
  newFileBytes.set(newHeadersSectionChecksum, C.HEADERS_SECTION_CHECKSUM_START_OFFSET);

  return newFileBytes.buffer;
}