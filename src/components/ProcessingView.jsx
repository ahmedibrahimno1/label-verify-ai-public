/**
 * Label Verify AI — Processing View
 * Copyright (c) 2026 Dr. Ahmed Mohamed Ibrahim. All rights reserved.
 * https://elevationtechnology.org
 */

export default function ProcessingView({ files, statusMap, onCancel }) {
  const total = files.length;
  const done = files.filter(f => statusMap[f.id]?.stage === 'done').length;
  const errors = files.filter(f => statusMap[f.id]?.stage === 'error').length;
  const progressPct = total > 0 ? Math.round(((done + errors) / total) * 100) : 0;

  return (
    <section className="processing-section">
      <h2 className="processing-heading">Analyzing Labels</h2>

      <div className="progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <p className="progress-label">{done + errors} of {total} complete</p>

      <div className="processing-list">
        {files.map(fileEntry => {
          const entry = statusMap[fileEntry.id] ?? {};
          const stage = entry.stage ?? 'pending';

          return (
            <div key={fileEntry.id} className={`processing-row stage-${stage}`}>
              <span className="processing-icon" aria-hidden="true">
                {stage === 'done' ? '✓' : stage === 'error' ? '✗' : stage === 'active' ? '⟳' : '○'}
              </span>
              <div className="processing-info">
                <span className="processing-name">{fileEntry.file.name}</span>
                {stage === 'active' && (
                  <span className="processing-elapsed">{(entry.ms / 1000).toFixed(1)}s</span>
                )}
                {stage === 'error' && (
                  <span className="processing-error">{entry.error}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="processing-actions">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}
