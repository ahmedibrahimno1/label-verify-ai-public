/**
 * Label Verify AI — Results View
 * Copyright (c) 2026 Dr. Ahmed Mohamed Ibrahim. All rights reserved.
 * https://elevationtechnology.org
 */

import { useState } from 'react';
import { STATUS } from '../constants.js';
import { exportResultsToCSV, triggerPrintExport } from '../lib/exportUtils.js';

function StatusBadge({ status }) {
  const label = { PASS: 'Pass', FAIL: 'Fail', REVIEW: 'Review' }[status] ?? status;
  return <span className={`status-badge badge-${status.toLowerCase()}`}>{label}</span>;
}

function ConfidencePill({ confidence }) {
  return <span className={`confidence-pill conf-${confidence.toLowerCase()}`}>{confidence}</span>;
}

function DiffView({ segments }) {
  if (!segments?.length) return null;
  return (
    <span className="diff-view">
      {segments.map((seg, i) => (
        <span key={i} className={`diff-${seg.type}`}>{seg.text} </span>
      ))}
    </span>
  );
}

function FieldRow({ field }) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = field.diff && field.diff.length > 0;

  return (
    <div className={`field-row status-${field.status.toLowerCase()}`}>
      <div className="field-row-header" onClick={() => hasDiff && setExpanded(p => !p)}>
        <StatusBadge status={field.status} />
        <span className="field-label">{field.label}</span>
        <ConfidencePill confidence={field.confidence} />
        {hasDiff && <span className="field-toggle">{expanded ? '▲' : '▼'}</span>}
      </div>

      <div className="field-extracted">{field.extracted}</div>

      {field.appValue && (
        <div className="field-app-value">Application: {field.appValue}</div>
      )}

      {field.note && (
        <div className="field-note">{field.note}</div>
      )}

      {expanded && hasDiff && (
        <div className="field-diff">
          <p className="diff-label">Warning text diff (expected → actual):</p>
          <DiffView segments={field.diff} />
        </div>
      )}
    </div>
  );
}

function ComplianceCard({ fileEntry, result }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`compliance-card overall-${result.overallStatus.toLowerCase()}`}>
      <div className="card-header" onClick={() => setOpen(p => !p)}>
        <div className="card-title-group">
          <StatusBadge status={result.overallStatus} />
          <span className="card-filename">{fileEntry.file.name}</span>
        </div>
        <span className="card-chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="card-body">
          {result.fields.map(field => (
            <FieldRow key={field.key} field={field} />
          ))}
          {result.notes && <p className="card-notes">{result.notes}</p>}
        </div>
      )}
    </div>
  );
}

export default function ResultsView({ files, resultMap, statusMap, appData, onNewAnalysis }) {
  const analyzed = files.filter(f => resultMap[f.id]);
  const errors = files.filter(f => statusMap[f.id]?.stage === 'error');

  const counts = { [STATUS.PASS]: 0, [STATUS.FAIL]: 0, [STATUS.REVIEW]: 0 };
  analyzed.forEach(f => {
    const s = resultMap[f.id]?.overallStatus;
    if (s && counts[s] !== undefined) counts[s]++;
  });

  return (
    <section className="results-section">
      <div className="results-summary">
        <span className="summary-title">{analyzed.length} Label{analyzed.length !== 1 ? 's' : ''} Analyzed</span>
        {counts[STATUS.PASS] > 0 && <span className="summary-stat stat-pass">{counts[STATUS.PASS]} Passed</span>}
        {counts[STATUS.FAIL] > 0 && <span className="summary-stat stat-fail">{counts[STATUS.FAIL]} Failed</span>}
        {counts[STATUS.REVIEW] > 0 && <span className="summary-stat stat-review">{counts[STATUS.REVIEW]} Needs Review</span>}
        {errors.length > 0 && <span className="summary-stat stat-error">{errors.length} Error{errors.length !== 1 ? 's' : ''}</span>}
      </div>

      <div className="results-actions no-print">
        <button className="btn-primary" onClick={onNewAnalysis}>+ New Analysis</button>
        {analyzed.length > 0 && (
          <>
            <button className="btn-secondary" onClick={() => exportResultsToCSV(files, resultMap)}>Export CSV</button>
            <button className="btn-secondary" onClick={triggerPrintExport}>Export PDF</button>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="error-list">
          {errors.map(f => (
            <div key={f.id} className="error-item">
              <strong>{f.file.name}:</strong> {statusMap[f.id]?.error ?? 'Processing failed.'}
            </div>
          ))}
        </div>
      )}

      <div className="results-list">
        {analyzed.map(f => (
          <ComplianceCard key={f.id} fileEntry={f} result={resultMap[f.id]} />
        ))}
      </div>
    </section>
  );
}
