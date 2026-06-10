/**
 * Label Verify AI — Application Data Form
 * Optionally enter COLA application fields to compare against label.
 *
 * Copyright (c) 2026 Dr. Ahmed Mohamed Ibrahim. All rights reserved.
 * https://elevationtechnology.org
 */

import { useState, useCallback } from 'react';
import { FIELD_KEYS, FIELD_LABELS } from '../constants.js';

const OPTIONAL_FIELDS = [
  FIELD_KEYS.BRAND,
  FIELD_KEYS.CLASS,
  FIELD_KEYS.ABV,
  FIELD_KEYS.NET,
  FIELD_KEYS.PRODUCER,
  FIELD_KEYS.ORIGIN,
];

function buildBlankEntry() {
  return Object.fromEntries(OPTIONAL_FIELDS.map(k => [k, '']));
}

export default function AppDataForm({ files, onAnalyze, onBack }) {
  const [formData, setFormData] = useState(() =>
    Object.fromEntries(files.map(f => [f.id, buildBlankEntry()]))
  );
  const [expandedId, setExpandedId] = useState(files[0]?.id ?? null);

  const updateField = useCallback((fileId, fieldKey, value) => {
    setFormData(prev => ({
      ...prev,
      [fileId]: { ...prev[fileId], [fieldKey]: value },
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    onAnalyze(formData);
  }, [formData, onAnalyze]);

  return (
    <section className="appdata-section">
      <h2 className="appdata-heading">Application Data <span className="badge-optional">Optional</span></h2>
      <p className="appdata-description">
        Enter COLA application values to compare against label content. Leave blank to skip comparison.
      </p>

      {files.map(fileEntry => (
        <div key={fileEntry.id} className="appdata-card">
          <button
            className="appdata-toggle"
            onClick={() => setExpandedId(prev => prev === fileEntry.id ? null : fileEntry.id)}
            aria-expanded={expandedId === fileEntry.id}
          >
            <span className="appdata-filename">{fileEntry.file.name}</span>
            <span className="appdata-chevron">{expandedId === fileEntry.id ? '▲' : '▼'}</span>
          </button>

          {expandedId === fileEntry.id && (
            <div className="appdata-fields">
              {OPTIONAL_FIELDS.map(fieldKey => (
                <label key={fieldKey} className="appdata-field">
                  <span className="appdata-label">{FIELD_LABELS[fieldKey]}</span>
                  <input
                    type="text"
                    className="appdata-input"
                    value={formData[fileEntry.id]?.[fieldKey] ?? ''}
                    onChange={e => updateField(fileEntry.id, fieldKey, e.target.value)}
                    placeholder="Leave blank to skip"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="appdata-actions">
        <button className="btn-primary" onClick={handleSubmit}>
          Analyze {files.length} Label{files.length !== 1 ? 's' : ''} &rarr;
        </button>
        <button className="btn-ghost" onClick={onBack}>
          &larr; Back
        </button>
      </div>
    </section>
  );
}
