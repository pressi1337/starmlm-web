import {
  FileText,
  Image as ImageIcon,
  Sheet,
  FileType2,
  Video,
  Music,
  Archive,
  Presentation,
  File as FileIcon,
} from "lucide-react";

/**
 * Mirrors CompanyPersonalDocument::FILE_TYPE_* on the server.
 * 1-3 predate the wider format support and keep their original meaning.
 */
export const FILE_TYPE = {
  IMAGE: 1,
  PDF: 2,
  EXCEL: 3,
  WORD: 4,
  VIDEO: 5,
  ARCHIVE: 6,
  AUDIO: 7,
  SLIDES: 8,
  TEXT: 9,
  OTHER: 10,
} as const;

/**
 * Only a real image can be rendered in an <img>.
 *
 * This must be an explicit equality check, never "not PDF and not Excel" —
 * with videos and archives in the mix, a loose check would try to render a
 * 500 MB video as an image, downloading the whole thing just to fail.
 */
export const isImageType = (fileType: any): boolean =>
  Number(fileType) === FILE_TYPE.IMAGE;

const ICONS: Record<number, { Icon: any; cls: string }> = {
  [FILE_TYPE.IMAGE]: { Icon: ImageIcon, cls: "bg-blue-50 text-blue-600" },
  [FILE_TYPE.PDF]: { Icon: FileText, cls: "bg-red-50 text-red-600" },
  [FILE_TYPE.EXCEL]: { Icon: Sheet, cls: "bg-emerald-50 text-emerald-600" },
  [FILE_TYPE.WORD]: { Icon: FileType2, cls: "bg-sky-50 text-sky-700" },
  [FILE_TYPE.VIDEO]: { Icon: Video, cls: "bg-purple-50 text-purple-600" },
  [FILE_TYPE.ARCHIVE]: { Icon: Archive, cls: "bg-amber-50 text-amber-700" },
  [FILE_TYPE.AUDIO]: { Icon: Music, cls: "bg-pink-50 text-pink-600" },
  [FILE_TYPE.SLIDES]: { Icon: Presentation, cls: "bg-orange-50 text-orange-600" },
  [FILE_TYPE.TEXT]: { Icon: FileText, cls: "bg-gray-100 text-gray-600" },
  [FILE_TYPE.OTHER]: { Icon: FileIcon, cls: "bg-gray-100 text-gray-600" },
};

export const fileTypeIcon = (fileType: any) =>
  ICONS[Number(fileType)] ?? ICONS[FILE_TYPE.OTHER];

/** Extension -> type, mirroring the server. Used before a file is uploaded. */
const BY_EXTENSION: Record<string, number> = {};
const register = (type: number, extensions: string[]) =>
  extensions.forEach((ext) => (BY_EXTENSION[ext] = type));

register(FILE_TYPE.IMAGE, ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "heic", "heif", "tiff", "tif", "ico", "avif"]);
register(FILE_TYPE.PDF, ["pdf"]);
register(FILE_TYPE.EXCEL, ["xls", "xlsx", "xlsm", "xlsb", "csv", "ods"]);
register(FILE_TYPE.WORD, ["doc", "docx", "docm", "odt", "rtf"]);
register(FILE_TYPE.SLIDES, ["ppt", "pptx", "pptm", "odp"]);
register(FILE_TYPE.VIDEO, ["mp4", "mov", "avi", "mkv", "webm", "m4v", "mpg", "mpeg", "3gp", "wmv", "flv"]);
register(FILE_TYPE.AUDIO, ["mp3", "wav", "ogg", "m4a", "aac", "flac", "wma", "amr"]);
register(FILE_TYPE.ARCHIVE, ["zip", "rar", "7z", "tar", "gz", "tgz", "bz2", "xz"]);
register(FILE_TYPE.TEXT, ["txt", "log", "md", "json", "xml", "yml", "yaml"]);

export const typeFromName = (name: string): number => {
  const ext = String(name ?? "").split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[ext] ?? FILE_TYPE.OTHER;
};

/**
 * Mirrors CompanyPersonalDocument::BLOCKED_EXTENSIONS — the extensions a web
 * server may execute. Checked here only to fail fast with a clear message;
 * the server rejects them regardless.
 */
const BLOCKED = new Set([
  "php", "php2", "php3", "php4", "php5", "php6", "php7", "php8",
  "phps", "phpt", "pht", "phtml", "phar", "inc",
  "asp", "aspx", "ascx", "ashx", "asmx", "cer",
  "jsp", "jspx", "jsw", "jsv", "jspf",
  "cgi", "pl", "py", "rb", "sh", "bash",
  "htaccess", "htpasswd",
]);

export const isBlockedFileName = (name: string): boolean => {
  const ext = String(name ?? "").split(".").pop()?.toLowerCase() ?? "";
  return BLOCKED.has(ext);
};
