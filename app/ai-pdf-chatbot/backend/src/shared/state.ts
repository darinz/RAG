// Import the Document type from LangChain core
import { Document } from '@langchain/core/documents';
// Import UUID v4 generator to assign unique IDs to documents
import { v4 as uuidv4 } from 'uuid';

/**
 * Reducer function to update a list of documents in a stateful way.
 * 
 * This is useful in LangGraph/agent workflows where document lists are updated
 * based on various input types (e.g., strings, arrays, or even delete signals).
 *
 * @param existing - The current array of documents (may be undefined).
 * @param newDocs - New input data: could be documents, strings, metadata objects, or 'delete'.
 * @returns An updated array of Document objects.
 */
export function reduceDocs(
  existing?: Document[],
  newDocs?:
    | Document[]
    | { [key: string]: any }[] // Array of objects (metadata only)
    | string[]                 // Array of raw string content
    | string                   // Single raw string
    | 'delete',                // Special keyword to delete all documents
): Document[] {
  // If 'delete' command is given, clear the entire list
  if (newDocs === 'delete') {
    return [];
  }

  // Default to empty list if no existing docs
  const existingList = existing || [];

  // Create a Set of UUIDs to track existing documents (avoids duplicates)
  const existingIds = new Set(existingList.map((doc) => doc.metadata?.uuid));

  // If a single string is passed, treat it as a new document with auto-generated UUID
  if (typeof newDocs === 'string') {
    const docId = uuidv4();
    return [
      ...existingList,
      { pageContent: newDocs, metadata: { uuid: docId } },
    ];
  }

  // This will hold new documents that need to be added
  const newList: Document[] = [];

  // If the input is an array (strings, documents, or objects)
  if (Array.isArray(newDocs)) {
    for (const item of newDocs) {
      if (typeof item === 'string') {
        // Handle plain string content
        const itemId = uuidv4();
        newList.push({ pageContent: item, metadata: { uuid: itemId } });
        existingIds.add(itemId);
      } else if (typeof item === 'object') {
        // Try to extract UUID if available
        const metadata = (item as Document).metadata ?? {};
        let itemId = metadata.uuid ?? uuidv4();

        // Only add if this UUID hasn't already been seen
        if (!existingIds.has(itemId)) {
          if ('pageContent' in item) {
            // Treat as a full Document-like object
            newList.push({
              ...(item as Document),
              metadata: { ...metadata, uuid: itemId },
            });
          } else {
            // Treat as metadata-only object with empty content
            newList.push({
              pageContent: '',
              metadata: { ...(item as { [key: string]: any }), uuid: itemId },
            });
          }
          // Track this UUID as used
          existingIds.add(itemId);
        }
      }
    }
  }

  // Return the combined result: old docs + new ones (non-duplicates only)
  return [...existingList, ...newList];
}