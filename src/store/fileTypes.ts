import textIcon from "../assets/files/word.png";
import pdfIcon from "../assets/files/pdf.png";
import videoIcon from "../assets/files/video.png";
import imageIcon from "../assets/files/image.png";
import wordIcon from "../assets/files/word.png";
import mp3Icon from "../assets/files/mp3.png";
import codeIcon from "../assets/files/code.png";
import zipIcon from "../assets/files/zip.png";
import pptIcon from "../assets/files/powerpoint.png";
import xlsIcon from "../assets/files/excel.png";
import docIcon from "../assets/files/doc.png";
import unknownIcon from "../assets/files/text.png";

export type FileType =
  | "text"
  | "image"
  | "pdf"
  | "audio"
  | "video"
  | "archive"
  | "code"
  | "doc"
  | "presentation"
  | "spreadsheet"
  | "unknown";

const fileIcons = {
  text: textIcon,
  image: imageIcon,
  pdf: pdfIcon,
  audio: mp3Icon,
  video: videoIcon,
  archive: zipIcon,
  code: codeIcon,
  doc: docIcon,
  presentation: pptIcon,
  spreadsheet: xlsIcon,
  unknown: unknownIcon,
};

const fileTypes = {
  image: {
    avif: "image/avif",
    bmp: "image/bmp",
    tif: "image/tiff",
    gif: "image/gif",
    png: "image/png",
    svg: "image/svg+xml",
    webp: "image/webp",
    ico: "image/vnd.microsoft.icon",
    jpeg: "image/jpeg",
  },

  // video
  video: {
    avi: "video/x-msvideo",
    oga: "audio/ogg",
    ogv: "video/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    "3gp": "audio/video",
    "3g2": "audio/video",
    mpeg: "video/mpeg",
  },

  // zip
  archive: {
    bz: "application/x-bzip",
    bz2: "application/x-bzip2",
    zip: "application/zip",
    gz: "application/gzip",
    rar: "application/vnd.rar",
    tar: "application/x-tar",
    "7z": "application/x-7z-compressed",
  },

  // audio
  audio: {
    aac: "audio/aac",
    mp3: "audio/mpeg",
    mid: "audio/midi",
    wav: "audio/wav",
    weba: "audio/webm",
  },

  // code
  code: {
    css: "text/css",
    csv: "text/csv",
    htm: "text/html",
    js: "text/javascript",
    json: "application/json",
    mjs: "text/javascript",
    xml: "application/xml",
  },

  text: {
    txt: "text/plain",
  },

  // doc
  doc: {
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },

  presentation: {
    odp: "application/vnd.oasis.opendocument.presentation",
    odt: "application/vnd.oasis.opendocument.text",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },

  spreadsheet: {
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
  },

  // other
  unknown: {
    bin: "application/octet-stream",
  },

  // pdf
  pdf: {
    pdf: "application/pdf",
  },
} as { [Key in FileType as string]: { [key: string]: string } };

export function fileType(ext?: string): FileType {
  const keys = Object.keys(fileTypes) as FileType[];
  for (let k = 0; k < keys.length; k++) {
    const fileType = keys[k];
    const extList = Object.keys(fileTypes[fileType]);
    for (let j = 0; j < extList.length; j++) {
      const ext_ = extList[j];
      if (ext_ == ext) return fileType;
    }
  }
  return "unknown";
}

export function fileMeme(ext?: string): string {
  const type = fileType(ext);
  return fileTypes[type][ext || ""] || "application/octet-stream";
}

export function fileIcon(ext?: string) {
  const type = fileType(ext);
  return fileIcons[type];
}
