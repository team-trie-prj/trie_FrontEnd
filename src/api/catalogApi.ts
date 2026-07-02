import { get, post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_CATALOG } from '@/mocks/commonMocks';
import type { ApiCatalogEntry, CatalogRegisterRequest } from '@/types/catalog';

export async function listCatalog(): Promise<ApiCatalogEntry[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_CATALOG]);
  return get<ApiCatalogEntry[]>(ENDPOINTS.catalog.list);
}

/** FNC-PUB-01 · 등록 + 연동 테스트(1회 Ping & Request). */
export async function registerCatalog(req: CatalogRegisterRequest): Promise<ApiCatalogEntry> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    if (!req.endpointUrl.startsWith('http')) throw new Error('API 연동 실패: 유효하지 않은 URL');
    return {
      id: `c${Date.now()}`,
      name: req.name,
      endpointUrl: req.endpointUrl,
      params: req.params,
      apiKeyMasked: req.apiKey.slice(0, 4) + '********',
      status: 'active',
      registeredAt: new Date().toISOString(),
    };
  }
  return post<ApiCatalogEntry>(ENDPOINTS.catalog.register, req);
}
