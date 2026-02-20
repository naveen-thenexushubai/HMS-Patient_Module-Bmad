import * as fs from 'fs'
import * as path from 'path'

/**
 * Creates a minimal valid JPEG test image at the given path.
 * Uses a hardcoded 1×1 px white JPEG (the smallest possible valid JPEG ≈ 670 bytes).
 */
export function createTestImage(filePath: string, label = 'test') {
  // Minimal 2×2 px blue JPEG — valid image browsers and the server will accept
  const MINIMAL_JPEG = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
    'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
    'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
    'MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA' +
    'AAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/' +
    'aAAwDAQACEQMRAD8AJQAB/9k=',
    'base64'
  )
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, MINIMAL_JPEG)
  return filePath
}

/**
 * Creates a fake "non-image" file (plain text) to test rejection of invalid types.
 */
export function createTextFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, 'This is not an image file.')
  return filePath
}
