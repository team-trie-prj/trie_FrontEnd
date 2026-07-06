import { del, get, patch, post } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from './config';
import { MOCK_CATALOG } from '@/mocks/commonMocks';
import type { ApiCatalogEntry, CatalogRegisterRequest } from '@/types/catalog';

/** /public-data 서버 DTO */
interface ServerCatalog {
  id: number;
  name: string;
  provider?: string;
  domain?: string;
  endpoint: string;
  params_spec?: { name: string; required?: boolean; map_from?: string }[];
  api_key_name?: string;
  created_at: string;
}

const toEntry = (c: ServerCatalog): ApiCatalogEntry => ({
  id: String(c.id),
  name: c.name,
  endpointUrl: c.endpoint,
  params: (c.params_spec ?? []).map((p) => ({
    name: p.name,
    required: Boolean(p.required),
    description: p.map_from ? `엔티티 매핑: ${p.map_from}` : undefined,
  })),
  apiKeyMasked: c.api_key_name ? `${c.api_key_name} (서버 보관)` : '—',
  status: 'active',
  registeredAt: c.created_at,
});

export async function listCatalog(): Promise<ApiCatalogEntry[]> {
  if (USE_MOCK) return Promise.resolve([...MOCK_CATALOG]);
  return (await get<ServerCatalog[]>(ENDPOINTS.catalog.list)).map(toEntry);
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'api_key';

/** FNC-PUB-01 · 등록 + 연동 테스트.
 *  서버는 등록과 실시간 호출이 분리되어 있어 등록→테스트 호출→실패 시 롤백(DELETE)으로
 *  "테스트 통과 시에만 저장" 명세를 만족시킨다. */
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

  const keyName = `key_${slug(req.name)}`;
  await post(ENDPOINTS.apiKeys.upsert, {
    name: keyName,
    provider: new URL(req.endpointUrl).hostname,
    secret: req.apiKey,
    description: `${req.name} 서비스키`,
  });
  const created = await post<ServerCatalog>(ENDPOINTS.catalog.register, {
    name: req.name,
    provider: new URL(req.endpointUrl).hostname,
    domain: 'etc',
    endpoint: req.endpointUrl,
    http_method: 'GET',
    params_spec: req.params.map((p) => ({ name: p.name, type: 'str', required: p.required })),
    api_key_name: keyName,
    api_key_param: 'serviceKey', // TODO(BE 확인 #10): 키 파라미터명 입력 UI 필요 여부
  });
  try {
    await patch(ENDPOINTS.catalog.fetchTest(String(created.id)), { entities: {} });
  } catch (e) {
    await del(ENDPOINTS.catalog.remove(String(created.id))).catch(() => undefined);
    throw new Error(`API 연동 실패: ${e instanceof Error ? e.message : '테스트 호출 실패'}`);
  }
  return toEntry(created);
}
