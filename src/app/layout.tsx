import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import { Header } from './components/header';

export const metadata: Metadata = {
  title: 'webdesk-将任何网页转化为桌面应用程序',
  description:
    'webdesk 让你快速将任何网页转化为跨平台的桌面应用程序，支持 macOS、Windows',
  keywords:
    'webdesk, 网页转桌面应用, electron桌面应用, 网站打包, macOS桌面应用, Windows桌面应用, 跨平台桌面应用, 网页转应用程序, electron打包, 网站转桌面端',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className='w-full h-full' >
          <AntdRegistry>{children}</AntdRegistry>
        </main>
      </body>
    </html>
  );
}
