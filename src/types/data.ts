/** FNC-DAT-01 · 사내 비정형 문서 업로드 및 파싱 */

export type UploadStatus = 'queued' | 'uploading' | 'parsing' | 'embedding' | 'done' | 'error';

export interface UploadItem {
  id: string;
  fileName: string;
  size: number;
  status: UploadStatus;
  /** 0~100 */
  progress: number;
  errorMessage?: string;
  uploadedAt: string;
}

/** 서버에 적재 완료된 문서 (FNC-DAT-02 · ChromaDB 인덱싱 + PostgreSQL 메타) */
export interface StoredDocument {
  id: string;
  fileName: string;
  /** 파싱된 글자 수 (서버 char_count) */
  charCount: number;
  /** 시맨틱 청킹 후 임베딩된 청크 수 */
  chunkCount: number;
  domain: string;
  uploadedAt: string;
}
