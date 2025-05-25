// All offsets are 0-based

// Slot data
export const SLOT_START_OFFSET = 0x310;
export const SLOT_LENGTH = 0x280000; // 2,621,440 bytes
export const MAX_SLOTS = 10;

// Save headers section (contains individual character headers and active flags)
export const SAVE_HEADERS_SECTION_START_OFFSET = 0x19003B0;
export const SAVE_HEADERS_SECTION_LENGTH = 0x60000; // 393,216 bytes

// Individual character header within the save headers section
export const SAVE_HEADER_START_OFFSET_IN_FILE = 0x1901D0E; // Start of the first character's header
export const SAVE_HEADER_LENGTH = 0x24C; // 588 bytes

// Character active status (array of 10 bytes, 1 for active, 0 for inactive)
// This is relative to the start of the file
export const CHAR_ACTIVE_STATUS_START_OFFSET = 0x1901D04;

// Offsets relative to the start of an individual character's header (SAVE_HEADER_START_OFFSET_IN_FILE + (slotIndex * SAVE_HEADER_LENGTH))
export const CHAR_NAME_OFFSET_IN_HEADER = 0x0; // Character name starts at the beginning of its header
export const CHAR_NAME_MAX_BYTES = 0x22; // 34 bytes for name (17 UTF-16LE characters)
export const CHAR_LEVEL_OFFSET_IN_HEADER = 0x22; // 1 byte for level
export const CHAR_PLAYED_SECONDS_OFFSET_IN_HEADER = 0x26; // 4 bytes for seconds played (Int32LE)

// Steam ID (assumed location and length)
export const STEAM_ID_OFFSET_IN_FILE = 0x19003A4;
export const STEAM_ID_LENGTH = 8; // SteamID64

// Checksum related
export const CHECKSUM_LENGTH = 0x10; // 16 bytes (MD5)
// Offset for slot checksum is 16 bytes BEFORE the actual slot data
export const SLOT_CHECKSUM_OFFSET_RELATIVE_TO_SLOT_START = -0x10;
// Offset for headers section checksum is 16 bytes BEFORE the headers section
export const HEADERS_CHECKSUM_OFFSET_RELATIVE_TO_HEADERS_START = -0x10;

// This refers to the save data for a single character slot (SLOT_LENGTH)
// Its checksum is stored at: (SLOT_START_OFFSET + (slotIndex * 0x10) + (slotIndex * SLOT_LENGTH)) - 0x10
// The C# code has `slotIndex * 0x10` - this 0x10 is the checksum size.
// So, actual data for slot `i` is at `SLOT_START_OFFSET + (i * CHECKSUM_LENGTH) + (i * SLOT_LENGTH)`
// And its checksum is at `(SLOT_START_OFFSET + (i * CHECKSUM_LENGTH) + (i * SLOT_LENGTH)) - CHECKSUM_LENGTH`

// Corrected starting position of slot data, accounting for preceding checksums
// For slot `i`, its data block starts after `i` previous slots and `i+1` checksums.
// The first slot (index 0) data is at `SLOT_START_OFFSET + CHECKSUM_LENGTH`.
// Its checksum is at `SLOT_START_OFFSET`.
// Slot `i` data start: `SLOT_START_OFFSET + ( (SLOT_LENGTH + CHECKSUM_LENGTH) * i ) + CHECKSUM_LENGTH`
// Slot `i` checksum start: `SLOT_START_OFFSET + ( (SLOT_LENGTH + CHECKSUM_LENGTH) * i )`

export function getSlotChecksumStartIndex(slotIndex: number): number {
  return SLOT_START_OFFSET + (slotIndex * (SLOT_LENGTH + CHECKSUM_LENGTH));
}

export function getSlotDataStartIndex(slotIndex: number): number {
  return getSlotChecksumStartIndex(slotIndex) + CHECKSUM_LENGTH;
}

// Header section checksum
export const HEADERS_SECTION_CHECKSUM_START_OFFSET = SAVE_HEADERS_SECTION_START_OFFSET + HEADERS_CHECKSUM_OFFSET_RELATIVE_TO_HEADERS_START;
// Actual header data starts after its checksum
export const ACTUAL_SAVE_HEADERS_SECTION_START_OFFSET = SAVE_HEADERS_SECTION_START_OFFSET;


// Character specific header location in file
export function getCharHeaderStartIndexInFile(slotIndex: number): number {
  return SAVE_HEADER_START_OFFSET_IN_FILE + (slotIndex * SAVE_HEADER_LENGTH);
}
