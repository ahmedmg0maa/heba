import "server-only"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function extractGoogleDriveFileId(url: string) {
  const raw = text(url)
  if (!raw) return ""

  try {
    const parsed = new URL(raw)
    const host = parsed.hostname.toLowerCase()

    if (!host.includes("drive.google.com")) return ""

    const filePathMatch = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(parsed.pathname)
    if (filePathMatch?.[1]) return filePathMatch[1]

    const openId = parsed.searchParams.get("id")
    if (openId) return openId

    const ucId = parsed.searchParams.get("id")
    if (ucId) return ucId

    return ""
  } catch {
    return ""
  }
}

export function normalizeGoogleDriveCoverUrl(url: string) {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return text(url)
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

export function normalizeGoogleDriveResourceUrl(url: string) {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return text(url)
  return `https://drive.google.com/uc?id=${fileId}`
}
