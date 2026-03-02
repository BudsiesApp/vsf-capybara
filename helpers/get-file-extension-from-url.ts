export function getFileExtensionFromUrl (urlOrFilename: string): string | undefined {
  if (!urlOrFilename) {
    return;
  }

  const withoutQueryOrHash = urlOrFilename.split('#')[0].split('?')[0];

  // Handle cases like `/path/to/file.jpg` or `file.jpg`
  const parts = withoutQueryOrHash.split('/').filter(Boolean);
  const lastSegment = parts.length > 0 ? parts[parts.length - 1] : withoutQueryOrHash;

  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === lastSegment.length - 1) {
    return;
  }

  const ext = lastSegment.slice(dotIndex + 1).toLowerCase();

  if (!/^[a-z0-9]+$/.test(ext)) {
    return;
  }

  return ext;
}
