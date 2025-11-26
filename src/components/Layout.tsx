import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 ease-in-out ml-64 px-12 py-10 bg-zinc-50 border-l border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

