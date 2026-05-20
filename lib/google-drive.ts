import "server-only"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function isDriveHost(hostname: string) {
  const host = hostname.toLowerCase()
  return host === "drive.google.com" || host.endsWith(".drive.google.com")
}

export function extractGoogleDriveFileId(url: string) {
  const raw = text(url)
  if (!raw) return ""

  const parsed = parseUrl(raw)
  if (!parsed || !isDriveHost(parsed.hostname)) return ""

  const filePathMatch = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(parsed.pathname)
  if (filePathMatch?.[1]) return filePathMatch[1]

  const idFromQuery = parsed.searchParams.get("id")
  if (idFromQuery) return idFromQuery

  return ""
}

export function extractGoogleDriveFolderId(url: string) {
  const raw = text(url)
  if (!raw) return ""

  const parsed = parseUrl(raw)
  if (!parsed || !isDriveHost(parsed.hostname)) return ""

  const folderPathMatch = /\/drive\/folders\/([a-zA-Z0-9_-]+)/.exec(parsed.pathname)
  if (folderPathMatch?.[1]) return folderPathMatch[1]

  const folderId = parsed.searchParams.get("folderId")
  if (folderId) return folderId

  return ""
}

export function isGoogleDriveFolderUrl(url: string) {
  return Boolean(extractGoogleDriveFolderId(url))
}

export function normalizeGoogleDriveCoverUrl(url: string) {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return text(url)
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

export function normalizeGoogleDriveResourceUrl(url: string) {
  const folderId = extractGoogleDriveFolderId(url)
  if (folderId) return `https://drive.google.com/drive/folders/${folderId}`

  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return text(url)
  return `https://drive.google.com/uc?id=${fileId}`
}

export function normalizeGoogleDrivePreviewUrl(url: string) {
  const folderId = extractGoogleDriveFolderId(url)
  if (folderId) return `https://drive.google.com/drive/folders/${folderId}`

  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return text(url)
  return `https://drive.google.com/file/d/${fileId}/preview`
}

export function normalizeGoogleDriveDownloadUrl(url: string) {
  const folderId = extractGoogleDriveFolderId(url)
  if (folderId) return `https://drive.google.com/drive/folders/${folderId}`

  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return text(url)
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}
