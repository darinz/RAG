import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';

/**
 * Reduces the document array based on the provided new documents or actions.
 * 
 * This function handles various input types and ensures proper document management:
 * - Merges new documents with existing ones
 * - Handles string inputs by converting them to Document objects
 * - Prevents duplicate documents using UUID-based deduplication
 * - Supports deletion of all documents with 'delete' action
 * - Generates unique UUIDs for documents without them
 *
 * @param existing - The existing array of documents to merge with
 * @param newDocs - The new documents or actions to apply. Can be:
 *   - Document[]: Array of Document objects
 *   - { [key: string]: any }[]: Array of plain objects (converted to Documents)
 *   - string[]: Array of strings (converted to Documents with pageContent)
 *   - string: Single string (converted to Document)
 *   - 'delete': Special action to clear all documents
 * @returns The updated array of documents with proper deduplication
 * 
 * @example
 * ```typescript
 * // Add new documents
 * const updated = reduceDocs(existing, [newDoc1, newDoc2]);
 * 
 * // Add a string as document
 * const updated = reduceDocs(existing, "New content");
 * 
 * // Clear all documents
 * const updated = reduceDocs(existing, 'delete');
 * ```
 */
export function reduceDocs(
  existing?: Document[],
  newDocs?:
    | Document[]
    | { [key: string]: any }[]
    | string[]
    | string
    | 'delete',
): Document[] {
  if (newDocs === 'delete') {
    return [];
  }

  const existingList = existing || [];
  const existingIds = new Set(existingList.map((doc) => doc.metadata?.uuid));

  if (typeof newDocs === 'string') {
    const docId = uuidv4();
    return [
      ...existingList,
      { pageContent: newDocs, metadata: { uuid: docId } },
    ];
  }

  const newList: Document[] = [];
  if (Array.isArray(newDocs)) {
    for (const item of newDocs) {
      if (typeof item === 'string') {
        const itemId = uuidv4();
        newList.push({ pageContent: item, metadata: { uuid: itemId } });
        existingIds.add(itemId);
      } else if (typeof item === 'object') {
        const metadata = (item as Document).metadata ?? {};
        let itemId = metadata.uuid ?? uuidv4();

        if (!existingIds.has(itemId)) {
          if ('pageContent' in item) {
            // It's a Document-like object
            newList.push({
              ...(item as Document),
              metadata: { ...metadata, uuid: itemId },
            });
          } else {
            // It's a generic object, treat it as metadata
            newList.push({
              pageContent: '',
              metadata: { ...(item as { [key: string]: any }), uuid: itemId },
            });
          }
          existingIds.add(itemId);
        }
      }
    }
  }

  return [...existingList, ...newList];
}
