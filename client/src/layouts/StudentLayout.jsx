import Sidebar from '../components/Sidebar';

export default function StudentLayout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar role="student" />
      <div className="main-content">
        {title && (
          <header className="topbar">
            <h1 className="topbar-title">{title}</h1>
          </header>
        )}
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
