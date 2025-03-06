import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="main-container">
        {children}
      </main>
      <footer className="bg-gray-100 py-6 text-center text-gray-600 text-sm border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-6xl">
          &copy; {new Date().getFullYear()} Fantasy Baseball App
        </div>
      </footer>
    </div>
  );
};

export default Layout; 