// Ensure md5 function is globally available from js-md5 script
declare var md5: any;

export function bytesToUtf16LeString(bytes: Uint8Array, maxLengthChars?: number): string {
  let relevantBytes = bytes;
  if (maxLengthChars) {
    // Each char is 2 bytes
    relevantBytes = bytes.subarray(0, maxLengthChars * 2);
  }

  // Find null terminator (two zero bytes for UTF-16)
  let endIndex = relevantBytes.length;
  for (let i = 0; i < relevantBytes.length - 1; i += 2) {
    if (relevantBytes[i] === 0 && relevantBytes[i+1] === 0) {
      endIndex = i;
      break;
    }
  }
  
  const decoder = new TextDecoder('utf-16le');
  return decoder.decode(relevantBytes.subarray(0, endIndex));
}

export function bytesToInt32LE(bytes: Uint8Array): number {
  if (bytes.length < 4) throw new Error("Not enough bytes for Int32");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getInt32(0, true); // true for little-endian
}

export function findSubarrayIndices(mainArray: Uint8Array, subArray: Uint8Array): number[] {
  const indices: number[] = [];
  if (subArray.length === 0 || mainArray.length < subArray.length) {
    return indices;
  }

  for (let i = 0; i <= mainArray.length - subArray.length; i++) {
    let match = true;
    for (let j = 0; j < subArray.length; j++) {
      if (mainArray[i + j] !== subArray[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      indices.push(i);
    }
  }
  return indices;
}

export function replaceAllInUint8Array(
  original: Uint8Array,
  toFind: Uint8Array,
  toReplace: Uint8Array
): Uint8Array {
  if (toFind.length === 0) return original.slice(); // Return a copy if 'toFind' is empty
  if (toFind.length !== toReplace.length) {
    console.warn("replaceAllInUint8Array currently only supports find/replace of same length. SteamID should be same length.");
    // For this specific use case (SteamID), lengths must match.
    // A more generic version would be much more complex.
    if (toFind.length > toReplace.length || toFind.length < toReplace.length) {
        throw new Error("Find and replace arrays must have the same length for this simplified replacement.");
    }
  }
  
  const copy = original.slice(); // Work on a copy
  const indices = findSubarrayIndices(copy, toFind);
  
  for (const index of indices) {
    copy.set(toReplace, index);
  }
  return copy;
}


export function calculateMd5(data: Uint8Array): Uint8Array {
  if (typeof md5 === 'undefined') {
    throw new Error('js-md5 library is not loaded. Make sure md5.min.js is included.');
  }
  const hashArrayBuffer = md5.digest(data); // This returns a number[]
  return new Uint8Array(hashArrayBuffer);
}
