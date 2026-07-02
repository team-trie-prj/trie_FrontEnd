/** FNC-PUB-01 · 공공데이터 API 카탈로그 등록 및 연동 */

export interface ApiParamSpec {
  name: string;
  required: boolean;
  description?: string;
}

export interface ApiCatalogEntry {
  id: string;
  name: string;
  endpointUrl: string;
  params: ApiParamSpec[];
  /** 서버에 암호화 저장 — 프론트는 마스킹 표시만 */
  apiKeyMasked: string;
  status: 'active' | 'failed' | 'testing';
  registeredAt: string;
}

export interface CatalogRegisterRequest {
  name: string;
  endpointUrl: string;
  params: ApiParamSpec[];
  apiKey: string;
}
