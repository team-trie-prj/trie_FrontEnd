import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/** 예기치 못한 렌더링 오류가 전체 화면 백지화로 번지지 않도록 차단 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-bg text-ink">
          <p className="mb-2 text-lg font-semibold">문제가 발생했습니다</p>
          <p className="mb-6 text-[13px] text-mut">
            화면을 그리는 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="h-[46px] rounded-[23px] bg-white px-[22px] text-sm font-semibold text-black hover:bg-[#e9e9e9]"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
