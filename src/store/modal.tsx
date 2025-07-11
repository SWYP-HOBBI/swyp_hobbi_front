import { ModalState, ModalStore } from '@/types/modal';
import { create } from 'zustand';

/**
 * 모달 초기 상태
 *
 * 모달이 닫혀있을 때의 기본 상태값들을 정의합니다.
 *
 * 상태 구성:
 * - isOpen: 모달 열림 여부 (기본값: false)
 * - type: 모달 타입 (기본값: 'default')
 * - title: 모달 제목 (기본값: 빈 문자열)
 * - message: 모달 메시지 (기본값: 빈 문자열)
 * - confirmText: 확인 버튼 텍스트 (기본값: '확인')
 * - cancelText: 취소 버튼 텍스트 (기본값: '취소')
 * - showCancelButton: 취소 버튼 표시 여부 (기본값: false)
 *
 * 사용 목적:
 * - 모달 닫기 시 상태 초기화
 * - 일관된 기본값 제공
 * - 타입 안전성 보장
 */
const initialState: ModalState = {
  isOpen: false, // 모달 열림 여부
  type: 'default', // 모달 타입
  title: '', // 모달 제목
  message: '', // 모달 메시지
  confirmText: '확인', // 확인 버튼 텍스트
  cancelText: '취소', // 취소 버튼 텍스트
  showCancelButton: false, // 취소 버튼 표시 여부
};

/**
 * 모달 상태 관리 스토어
 *
 * Zustand를 사용하여 모달 관련 상태를 전역적으로 관리합니다.
 *
 * 주요 기능:
 * 1. 모달 열기/닫기 상태 관리
 * 2. 모달 콘텐츠 동적 설정
 * 3. 모달 타입별 커스터마이징
 * 4. 버튼 텍스트 및 표시 여부 제어
 *
 * 상태 관리:
 * - isOpen: 모달의 열림/닫힘 상태
 * - type: 모달의 타입 (스타일링, 동작 방식 결정)
 * - title: 모달 상단에 표시될 제목
 * - message: 모달 본문에 표시될 메시지
 * - confirmText: 확인 버튼의 텍스트
 * - cancelText: 취소 버튼의 텍스트
 * - showCancelButton: 취소 버튼 표시 여부
 *
 * 사용자 경험:
 * - 일관된 모달 UI/UX 제공
 * - 다양한 상황에 맞는 모달 커스터마이징
 * - 직관적인 모달 열기/닫기 인터페이스
 * - 접근성을 고려한 버튼 텍스트 설정
 *
 * 기술적 특징:
 * - Zustand를 통한 상태 관리
 * - TypeScript를 통한 타입 안전성
 * - 옵션 객체를 통한 유연한 모달 설정
 * - 상태 초기화를 통한 메모리 관리
 *
 * 확장성:
 * - 새로운 모달 타입 추가 가능
 * - 추가 옵션 속성 확장 가능
 * - 모달 스택 관리 기능 추가 가능
 */
export const useModalStore = create<ModalStore>((set) => ({
  // ===== 초기 상태 =====

  /**
   * 모달 열림 여부
   *
   * 모달이 현재 화면에 표시되고 있는지 여부를 나타냅니다.
   * false: 모달 숨김, true: 모달 표시
   */
  isOpen: false,

  /**
   * 모달 타입
   *
   * 모달의 스타일과 동작 방식을 결정하는 타입입니다.
   * 예: 'default', 'alert', 'confirm', 'custom' 등
   */
  type: 'default',

  /**
   * 모달 제목
   *
   * 모달 상단에 표시될 제목 텍스트입니다.
   * 빈 문자열일 경우 제목 영역이 숨겨질 수 있습니다.
   */
  title: '',

  /**
   * 모달 메시지
   *
   * 모달 본문에 표시될 메시지 텍스트입니다.
   * 주요 콘텐츠를 담는 역할을 합니다.
   */
  message: '',

  /**
   * 확인 버튼 텍스트
   *
   * 모달의 확인/확인 버튼에 표시될 텍스트입니다.
   * 기본값은 '확인'이며, 상황에 맞게 커스터마이징 가능합니다.
   */
  confirmText: '확인',

  /**
   * 취소 버튼 텍스트
   *
   * 모달의 취소 버튼에 표시될 텍스트입니다.
   * 기본값은 '취소'이며, 상황에 맞게 커스터마이징 가능합니다.
   */
  cancelText: '취소',

  /**
   * 취소 버튼 표시 여부
   *
   * 모달에 취소 버튼을 표시할지 여부를 결정합니다.
   * false: 확인 버튼만 표시, true: 확인/취소 버튼 모두 표시
   */
  showCancelButton: false,

  // ===== 액션 함수들 =====

  /**
   * 모달 열기 함수
   *
   * 모달을 열고 필요한 옵션들을 설정합니다.
   *
   * 처리 과정:
   * 1. isOpen을 true로 설정하여 모달 표시
   * 2. 전달받은 options 객체의 속성들을 상태에 병합
   * 3. 모달 컴포넌트에서 업데이트된 상태 반영
   *
   * 옵션 객체 구조:
   * - type: 모달 타입 (선택사항)
   * - title: 모달 제목 (선택사항)
   * - message: 모달 메시지 (선택사항)
   * - confirmText: 확인 버튼 텍스트 (선택사항)
   * - cancelText: 취소 버튼 텍스트 (선택사항)
   * - showCancelButton: 취소 버튼 표시 여부 (선택사항)
   *
   * 사용 시나리오:
   * - 사용자 액션에 대한 확인 요청
   * - 에러 메시지 표시
   * - 정보 알림
   * - 사용자 입력 요청
   *
   * 예시:
   * ```typescript
   * openModal({
   *   type: 'confirm',
   *   title: '삭제 확인',
   *   message: '정말 삭제하시겠습니까?',
   *   confirmText: '삭제',
   *   cancelText: '취소',
   *   showCancelButton: true
   * });
   * ```
   *
   * @param options - 모달 설정 옵션 객체
   */
  openModal: (options) =>
    set({
      isOpen: true, // 모달 열기
      ...options, // 전달받은 옵션들 병합
    }),

  /**
   * 모달 닫기 함수
   *
   * 모달을 닫고 모든 상태를 초기값으로 리셋합니다.
   *
   * 처리 과정:
   * 1. initialState 객체를 사용하여 모든 상태 초기화
   * 2. isOpen을 false로 설정하여 모달 숨김
   * 3. 다른 모든 속성들을 기본값으로 리셋
   *
   * 초기화되는 상태들:
   * - isOpen: false
   * - type: 'default'
   * - title: ''
   * - message: ''
   * - confirmText: '확인'
   * - cancelText: '취소'
   * - showCancelButton: false
   *
   * 사용 시나리오:
   * - 사용자가 확인/취소 버튼 클릭
   * - 모달 외부 영역 클릭
   * - ESC 키 입력
   * - 프로그래밍적으로 모달 닫기
   *
   * 장점:
   * - 메모리 누수 방지
   * - 일관된 상태 보장
   * - 다음 모달 열기 시 깨끗한 상태 유지
   */
  closeModal: () => set(initialState),
}));
