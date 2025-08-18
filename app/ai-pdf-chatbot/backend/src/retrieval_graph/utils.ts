// Import the Document type from LangChain, which includes `pageContent` and optional metadata.
import { Document } from '@langchain/core/documents';

/**
 * Format a single Document object into a string wrapped in a custom XML-like tag.
 * Includes both the document's content and its metadata as tag attributes.
 *
 * @param doc - A LangChain Document object.
 * @returns A formatted string representation of the document.
 */
export function formatDoc(doc: Document): string {
  // Extract metadata or default to an empty object if not provided.
  const metadata = doc.metadata || {};

  // Convert metadata key-value pairs into a string of attributes.
  // Example: { source: "pdf", page: 3 } -> " source=pdf page=3"
  const meta = Object.entries(metadata)
    .map(([k, v]) => ` ${k}=${v}`)
    .join('');

  // If metadata exists, prepend it with a space; otherwise, keep it empty.
  const metaStr = meta ? ` ${meta}` : '';

  // Return a custom-tag-wrapped document with metadata as attributes and page content inside.
  return `<document${metaStr}>\n${doc.pageContent}\n</document>`;
}

/**
 * Format a list of documents into a single XML-like string block.
 *
 * @param docs - An array of Document objects (can be undefined or empty).
 * @returns A string with all documents wrapped in a `<documents>` tag.
 */
export function formatDocs(docs?: Document[]): string {
  // Handle edge case: if docs is undefined or empty, return an empty tag.
  if (!docs || docs.length === 0) {
    return '<documents></documents>';
  }

  // Format each document individually, then join with newline spacing.
  const formatted = docs.map(formatDoc).join('\n');

  // Wrap all formatted documents in a root <documents> tag.
  return `<documents>\n${formatted}\n</documents>`;
}