import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 로그인하지 않은 사용자가 접근 가능한 경로 패턴
const PUBLIC_PATH_PATTERNS = [
  /^\/$/, // 홈
  /^\/signup$/, // 회원가입
  /^\/find_password$/, // 비밀번호 찾기
  /^\/verify_email$/, // 이메일 인증
  /^\/verify_fail$/, // 이메일 인증 실패
  /^\/posts$/, // 게시글 목록
  /^\/posts\/search/, // 게시글 검색
  /^\/posts\/\d+$/, // 게시글 상세보기 (/posts/1, /posts/123 등)
];

// 로그인한 사용자가 접근하면 리다이렉트할 경로
const AUTH_REDIRECT_PATHS = ['/', '/signup'];

export function middleware(request: NextRequest) {
  // 현재 경로
  const path = request.nextUrl.pathname;

  // auth-storage 쿠키 가져오기
  const authCookie = request.cookies.get('auth-storage');

  // 쿠키가 있고, 그 내용에 isAuthenticated: true가 있는지 확인
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

  // 로그인한 사용자가 '/' 또는 '/signup'에 접근하면 '/posts'로 리다이렉트
  if (isAuthenticated && AUTH_REDIRECT_PATHS.includes(path)) {
    return NextResponse.redirect(new URL('/posts', request.url));
  }

  // 로그인하지 않은 사용자의 접근 제어
  if (!isAuthenticated) {
    // PUBLIC_PATH_PATTERNS 중 하나라도 매칭되면 접근 허용
    const isPublicPath = PUBLIC_PATH_PATTERNS.some((pattern) =>
      pattern.test(path),
    );

    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
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
