/**
 * Label Verify AI — Header Component
 * Copyright (c) 2026 Dr. Ahmed Mohamed Ibrahim. All rights reserved.
 * https://elevationtechnology.org
 */

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-logo" aria-hidden="true">LV</div>
        <div className="header-text">
          <span className="header-title">Label Verify AI</span>
          <span className="header-subtitle">Alcohol Beverage Label Compliance Tool</span>
        </div>
      </div>
    </header>
  );
}
