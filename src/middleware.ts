import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 미들웨어 - 인증 및 라우팅 제어
 *
 * 애플리케이션의 모든 요청에 대해 인증 상태를 확인하고
 * 적절한 라우팅 제어를 수행하는 미들웨어입니다.
 *
 * 주요 기능:
 * 1. 인증되지 않은 사용자의 접근 제어
 * 2. 인증된 사용자의 리다이렉트 처리
 * 3. 공개 경로와 보호된 경로 구분
 * 4. 쿠키 기반 인증 상태 확인
 *
 * 동작 방식:
 * - 모든 페이지 요청에 대해 미들웨어 실행
 * - 쿠키에서 인증 상태 확인
 * - 경로 패턴 매칭을 통한 접근 제어
 * - 적절한 리다이렉트 처리
 *
 * 보안 고려사항:
 * - 인증되지 않은 사용자의 민감한 페이지 접근 차단
 * - 인증된 사용자의 불필요한 페이지 접근 방지
 * - 쿠키 파싱 에러 처리
 *
 * 성능 최적화:
 * - 정규식 패턴을 통한 효율적인 경로 매칭
 * - 필요한 경로에만 미들웨어 적용
 * - 빠른 리다이렉트 처리
 */

/**
 * 로그인하지 않은 사용자가 접근 가능한 공개 경로 패턴
 *
 * 인증이 필요하지 않은 페이지들의 경로 패턴을 정의합니다.
 * 정규식을 사용하여 유연한 패턴 매칭을 제공합니다.
 *
 * 패턴 설명:
 * - /^\/$/: 홈페이지 (정확히 '/' 경로)
 * - /^\/signup$/: 회원가입 페이지
 * - /^\/find_password$/: 비밀번호 찾기 페이지
 * - /^\/verify_email$/: 이메일 인증 페이지
 * - /^\/verify_fail$/: 이메일 인증 실패 페이지
 * - /^\/posts$/: 게시글 목록 페이지
 * - /^\/posts\/search/: 게시글 검색 페이지 (검색 파라미터 포함)
 * - /^\/posts\/\d+$/: 게시글 상세보기 페이지 (/posts/1, /posts/123 등)
 * - /^\/login\/social$/: 소셜 로그인 페이지
 * - /^\/oauth\/callback\/.*$/: OAuth 콜백 URL (모든 OAuth 제공자)
 *
 * 패턴 매칭 규칙:
 * - ^: 문자열 시작
 * - $: 문자열 끝
 * - \d+: 하나 이상의 숫자
 * - .*: 모든 문자 (0개 이상)
 * - \/: 슬래시 문자 (이스케이프)
 *
 * 보안 고려사항:
 * - 민감한 정보가 포함된 페이지는 제외
 * - API 경로는 별도로 처리
 * - 동적 경로에 대한 적절한 패턴 정의
 */
const PUBLIC_PATH_PATTERNS = [
  /^\/$/, // 홈
  /^\/signup$/, // 회원가입
  /^\/find_password$/, // 비밀번호 찾기
  /^\/verify_email$/, // 이메일 인증
  /^\/verify_fail$/, // 이메일 인증 실패
  /^\/posts$/, // 게시글 목록
  /^\/posts\/search/, // 게시글 검색
  /^\/posts\/\d+$/, // 게시글 상세보기 (/posts/1, /posts/123 등)
  /^\/login\/social$/, // 소셜 로그인
  /^\/oauth\/callback\/.*$/, // OAuth 콜백 URL 추가
];

/**
 * 로그인한 사용자가 접근하면 리다이렉트할 경로 목록
 *
 * 인증된 사용자가 접근할 필요가 없는 페이지들을 정의합니다.
 * 이러한 페이지에 접근하면 자동으로 메인 페이지로 리다이렉트됩니다.
 *
 * 리다이렉트 대상:
 * - '/': 홈페이지 (로그인 후에는 게시글 목록이 더 적합)
 * - '/signup': 회원가입 페이지 (이미 계정이 있으므로 불필요)
 * - '/login/social': 소셜 로그인 페이지 (이미 로그인되어 있으므로 불필요)
 *
 * 사용자 경험:
 * - 불필요한 페이지 접근 방지
 * - 직관적인 네비게이션 흐름
 * - 중복 로그인 시도 방지
 */
const AUTH_REDIRECT_PATHS = ['/', '/signup', '/login/social'];

/**
 * Next.js 미들웨어 함수
 *
 * 모든 요청에 대해 실행되며, 인증 상태에 따른 라우팅 제어를 수행합니다.
 *
 * 처리 과정:
 * 1. 현재 요청 경로 추출
 * 2. 인증 쿠키 확인 및 파싱
 * 3. 인증 상태에 따른 리다이렉트 처리
 * 4. 접근 권한 검증
 *
 * 인증 확인 로직:
 * - 'auth-storage' 쿠키 존재 여부 확인
 * - 쿠키 값 디코딩 및 JSON 파싱
 * - isAuthenticated 상태 확인
 * - 에러 발생 시 안전한 처리
 *
 * 리다이렉트 규칙:
 * - 인증된 사용자 + 리다이렉트 대상 경로 → '/posts'로 이동
 * - 미인증 사용자 + 보호된 경로 → '/'로 이동
 * - 그 외의 경우 → 정상 처리
 *
 * @param request - Next.js 요청 객체
 * @returns NextResponse - 응답 또는 리다이렉트
 */
export function middleware(request: NextRequest) {
  // ===== 현재 경로 추출 =====

  /**
   * 현재 요청의 경로를 추출합니다.
   *
   * nextUrl.pathname을 사용하여 쿼리 파라미터나 해시를 제외한
   * 순수한 경로 부분만 가져옵니다.
   *
   * 예시:
   * - 'https://example.com/posts?page=1' → '/posts'
   * - 'https://example.com/posts/123#comment' → '/posts/123'
   * - 'https://example.com/' → '/'
   */
  const path = request.nextUrl.pathname;

  // ===== 인증 쿠키 확인 =====

  /**
   * 'auth-storage' 쿠키를 가져옵니다.
   *
   * 이 쿠키는 Zustand 스토어의 인증 상태를 저장하는 데 사용됩니다.
   * 쿠키가 존재하지 않으면 undefined가 반환됩니다.
   *
   * 쿠키 구조:
   * - 이름: 'auth-storage'
   * - 값: URL 인코딩된 JSON 문자열
   * - 내용: { state: { isAuthenticated: boolean, ... } }
   */
  const authCookie = request.cookies.get('auth-storage');

  // ===== 인증 상태 파싱 =====

  /**
   * 쿠키에서 인증 상태를 파싱합니다.
   *
   * 처리 과정:
   * 1. 쿠키 값이 존재하는지 확인
   * 2. URL 디코딩 (decodeURIComponent)
   * 3. JSON 파싱 (JSON.parse)
   * 4. isAuthenticated 상태 추출
   *
   * 에러 처리:
   * - 쿠키가 없는 경우: false
   * - 디코딩 실패: false
   * - JSON 파싱 실패: false
   * - 구조가 예상과 다른 경우: false
   *
   * 기본값:
   * - 모든 에러 상황에서 false로 설정
   * - 보안을 위해 기본적으로 미인증 상태로 처리
   */
  let isAuthenticated = false;
  if (authCookie?.value) {
    try {
      const decodedValue = decodeURIComponent(authCookie.value);
      const authData = JSON.parse(decodedValue);
      isAuthenticated = authData.state?.isAuthenticated === true;
    } catch (error) {
      console.error('인증 쿠키 파싱 오류:', error);
    }
  }

  // ===== 인증된 사용자 리다이렉트 처리 =====

  /**
   * 로그인한 사용자가 불필요한 페이지에 접근할 때 리다이렉트합니다.
   *
   * 처리 조건:
   * - 사용자가 인증된 상태 (isAuthenticated === true)
   * - 접근한 경로가 AUTH_REDIRECT_PATHS에 포함된 경우
   *
   * 리다이렉트 대상:
   * - '/posts' 페이지로 이동
   * - 메인 콘텐츠 페이지로 안내
   *
   * 사용자 경험:
   * - 이미 로그인한 사용자를 적절한 페이지로 안내
   * - 불필요한 페이지 접근 방지
   * - 직관적인 네비게이션 흐름
   */
  if (isAuthenticated && AUTH_REDIRECT_PATHS.includes(path)) {
    return NextResponse.redirect(new URL('/posts', request.url));
  }

  // ===== 미인증 사용자 접근 제어 =====

  /**
   * 로그인하지 않은 사용자의 접근을 제어합니다.
   *
   * 처리 과정:
   * 1. 인증되지 않은 사용자인지 확인
   * 2. 현재 경로가 공개 경로인지 확인
   * 3. 보호된 경로 접근 시 홈페이지로 리다이렉트
   *
   * 공개 경로 확인:
   * - PUBLIC_PATH_PATTERNS 배열의 정규식 패턴과 매칭
   * - 하나라도 매칭되면 접근 허용
   * - 매칭되지 않으면 접근 차단
   *
   * 보안 목적:
   * - 민감한 페이지에 대한 무단 접근 방지
   * - 인증이 필요한 기능 보호
   * - 일관된 인증 정책 적용
   */
  if (!isAuthenticated) {
    // ===== 공개 경로 매칭 확인 =====

    /**
     * 현재 경로가 공개 경로 패턴 중 하나와 매칭되는지 확인합니다.
     *
     * some() 메서드를 사용하여:
     * - 배열의 모든 패턴을 순회
     * - 하나라도 매칭되면 true 반환
     * - 모든 패턴이 매칭되지 않으면 false 반환
     *
     * 정규식 테스트:
     * - pattern.test(path)로 패턴 매칭 확인
     * - 정확한 경로 매칭을 위해 ^와 $ 사용
     *
     * 매칭 예시:
     * - '/posts/123' → /^\/posts\/\d+$/ 패턴과 매칭
     * - '/posts/search?q=test' → /^\/posts\/search/ 패턴과 매칭
     * - '/my_page' → 어떤 패턴과도 매칭되지 않음
     */
    const isPublicPath = PUBLIC_PATH_PATTERNS.some((pattern) =>
      pattern.test(path),
    );

    // ===== 보호된 경로 접근 차단 =====

    /**
     * 공개 경로가 아닌 경우 홈페이지로 리다이렉트합니다.
     *
     * 처리 조건:
     * - 사용자가 인증되지 않은 상태
     * - 현재 경로가 공개 경로 패턴과 매칭되지 않음
     *
     * 리다이렉트 대상:
     * - '/' (홈페이지)로 이동
     * - 로그인 페이지로 안내
     *
     * 보안 효과:
     * - 무단 접근 차단
     * - 인증 유도
     * - 일관된 보안 정책 적용
     */
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ===== 정상 처리 =====

  /**
   * 모든 검증을 통과한 경우 정상적으로 요청을 처리합니다.
   *
   * 처리 조건:
   * - 인증된 사용자가 적절한 페이지에 접근
   * - 미인증 사용자가 공개 페이지에 접근
   *
   * 반환값:
   * - NextResponse.next(): 요청을 다음 단계로 전달
   * - 페이지 렌더링 또는 API 호출 진행
   */
  return NextResponse.next();
}

/**
 * 미들웨어 적용 범위 설정
 *
 * 미들웨어가 실행될 경로를 정의합니다.
 * 성능 최적화를 위해 필요한 경로에만 미들웨어를 적용합니다.
 *
 * matcher 패턴:
 * - '/((?!api|_next/static|_next/image|favicon.ico).*)'
 *
 * 패턴 해석:
 * - (?!...) : 부정형 전방 탐색 (negative lookahead)
 * - api : API 라우트 제외
 * - _next/static : Next.js 정적 파일 제외
 * - _next/image : Next.js 이미지 최적화 파일 제외
 * - favicon.ico : 파비콘 파일 제외
 * - .* : 모든 다른 경로 포함
 *
 * 제외 대상:
 * - API 라우트: 서버 사이드 로직이므로 클라이언트 인증과 무관
 * - 정적 파일: 이미지, CSS, JS 등은 인증 불필요
 * - 파비콘: 브라우저 자동 요청이므로 제외
 *
 * 성능 최적화:
 * - 불필요한 경로에서 미들웨어 실행 방지
 * - 정적 리소스 요청 시 오버헤드 최소화
 * - API 호출 시 인증 로직 분리
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
