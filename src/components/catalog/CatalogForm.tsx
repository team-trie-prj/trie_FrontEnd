import { useState } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Label from '@/components/common/Label';
import Spinner from '@/components/common/Spinner';
import { useCatalogRegistering, useCatalogActions } from '@/stores/catalogStore';

const inputCls =
  'w-full rounded-[10px] border border-line3 bg-panel2 px-3.5 py-[11px] text-sm text-[#C8C8C8] outline-none placeholder:text-mut4 focus:border-[#444]';

/** FNC-PUB-01 · API 등록 폼 (엔드포인트/파라미터 규격/인증키 → 등록 및 연동 테스트) */
export default function CatalogForm() {
  const registering = useCatalogRegistering();
  const { register } = useCatalogActions();
  const [name, setName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [paramsRaw, setParamsRaw] = useState('');
  const [apiKey, setApiKey] = useState('');

  const onSubmit = async () => {
    const params = paramsRaw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => ({ name: p.replace(/\*$/, ''), required: p.endsWith('*') }));
    const ok = await register({ name, endpointUrl, params, apiKey });
    if (ok) {
      setName('');
      setEndpointUrl('');
      setParamsRaw('');
      setApiKey('');
    }
  };

  const valid = name.trim() && endpointUrl.trim() && apiKey.trim();

  return (
    <Card>
      <Label className="mb-4">신규 API 등록</Label>
      <div className="flex flex-col gap-3.5">
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="API 이름" placeholder="API 이름 (예: 도로교통공단 사고 통계)" className={inputCls} />
        <input value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} aria-label="엔드포인트 URL" placeholder="엔드포인트 URL (https://apis.data.go.kr/…)" className={inputCls} />
        <input value={paramsRaw} onChange={(e) => setParamsRaw(e.target.value)} aria-label="파라미터 규격" placeholder="파라미터 규격 — 쉼표 구분, 필수는 * (예: siDo*, year)" className={inputCls} />
        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" aria-label="공공데이터포털 일반 인증키" placeholder="공공데이터포털 일반 인증키" className={inputCls} autoComplete="off" />
      </div>
      <Button onClick={() => void onSubmit()} disabled={!valid || registering} className="mt-5 w-full">
        {registering ? <Spinner /> : '등록 및 연동 테스트'}
      </Button>
      <p className="mt-3 text-center text-[11px] text-mut4">
        1회 테스트 호출(Ping)에 성공해야 카탈로그에 저장됩니다 · 인증키는 서버에서 암호화 보관
      </p>
    </Card>
  );
}
