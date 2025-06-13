import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import SSEHandler from '@/services/sse_handler';
import Providers from '@/services/providers';
const pretendard = localFont({
  src: '../assets/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'HOBBi',
  description: '취미 공유 커뮤니티 사이트',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`antialiased ${pretendard.variable}`}>
        <Script
          src="https://cdn.swygbro.com/public/widget/swyg-widget.js"
          strategy="afterInteractive"
          defer
        />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"
          integrity="sha384-dok87au0gKqJdxs7msEdBPNnKSRT+/mhTVzq+qOhcL464zXwvcrpjeWvyj1kCdq6"
          crossOrigin="anonymous"
          defer
        />
        <Providers>
          {children}
          <div id="modal-portal" />
          <div id="splash-screen" />
          <SSEHandler />
        </Providers>
      </body>
    </html>
  );
}
