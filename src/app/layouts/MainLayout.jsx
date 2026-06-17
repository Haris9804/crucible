import "../../styles/globals.css";

export default function MainLayout({ children }) {
  return (
    <div className="layout-root">
      
      {/* Background Layer */}
      <div className="layout-bg" />

      {/* Vignette */}
      <div className="layout-vignette" />

      {/* Content */}
      <main className="layout-content">
        {children}
      </main>

    </div>
  );
}