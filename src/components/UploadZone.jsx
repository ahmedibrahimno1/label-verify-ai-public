/**
 * Label Verify AI — Upload Zone Component
 * Copyright (c) 2026 Dr. Ahmed Mohamed Ibrahim. All rights reserved.
 * https://elevationtechnology.org
 */

import { useCallback, useRef, useState } from 'react';
import { SUPPORTED_MIME_TYPES, SUPPORTED_EXTENSIONS, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from '../constants.js';

function humanFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function deduplicateFiles(existing, incoming) {
  const seen = new Set(existing.map(e => `${e.file.name}::${e.file.size}`));
  return incoming.filter(e => {
    const k = `${e.file.name}::${e.file.size}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function buildEntry(file, index) {
  const isPreviewable = file.type.startsWith('image/');
  return {
    id: `entry-${Date.now()}-${index}`,
    file,
    preview: isPreviewable ? URL.createObjectURL(file) : null,
  };
}

export default function UploadZone({ entries, onChange, onProceed }) {
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  const validate = useCallback((fileList) => {
    setValidationError('');
    const errors = [];
    const valid = [];

    Array.from(fileList).forEach((file, i) => {
      if (!SUPPORTED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(txt|pdf)$/i)) {
        errors.push(`"${file.name}" is not a supported format (JPG, PNG, PDF, TXT).`);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        errors.push(`"${file.name}" exceeds the ${MAX_UPLOAD_MB} MB limit.`);
        return;
      }
      valid.push(buildEntry(file, i));
    });

    if (errors.length) setValidationError(errors.join(' '));
    if (!valid.length) return;

    const merged = [...entries, ...deduplicateFiles(entries, valid)];
    onChange(merged);
  }, [entries, onChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    validate(e.dataTransfer.files);
  }, [validate]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);

  const onInputChange = useCallback((e) => {
    if (e.target.files?.length) validate(e.target.files);
    e.target.value = '';
  }, [validate]);

  const removeEntry = useCallback((id) => {
    onChange(entries.filter(e => e.id !== id));
  }, [entries, onChange]);

  return (
    <section className="upload-section">
      <h1 className="upload-heading">Verify Alcohol Label Compliance</h1>
      <p className="upload-description">
        Upload one or more alcohol beverage label files to check against applicable laws and regulations.
      </p>

      <div
        className={`drop-target${dragging ? ' drag-active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload label files — click or drag and drop"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS}
          multiple
          className="drop-input"
          onChange={onInputChange}
          tabIndex={-1}
          aria-label="File input"
        />
        <div className="drop-icon" aria-hidden="true">📂</div>
        <p className="drop-primary">Drag &amp; drop label files here</p>
        <p className="drop-secondary">or <span>select files</span> from your computer</p>
        <p className="drop-hint">JPG, PNG, PDF, TXT &mdash; up to {MAX_UPLOAD_MB}&nbsp;MB per file</p>
      </div>

      {validationError && (
        <div className="upload-error" role="alert">{validationError}</div>
      )}

      {entries.length > 0 && (
        <>
          <div className="file-queue">
            <div className="file-queue-heading">
              {entries.length} file{entries.length !== 1 ? 's' : ''} selected
            </div>
            {entries.map(entry => (
              <div key={entry.id} className="file-row">
                {entry.preview
                  ? <img src={entry.preview} alt="" className="file-thumb" />
                  : <span className="file-thumb-icon" aria-hidden="true">📄</span>
                }
                <div className="file-meta">
                  <span className="file-name" title={entry.file.name}>{entry.file.name}</span>
                  <span className="file-size">{humanFileSize(entry.file.size)}</span>
                </div>
                <button
                  className="file-remove"
                  onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                  aria-label={`Remove ${entry.file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button className="btn-primary" onClick={onProceed}>Continue &rarr;</button>
            <button className="btn-ghost" onClick={() => onChange([])}>Clear all</button>
          </div>
        </>
      )}
    </section>
  );
}
