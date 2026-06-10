/**
 * Label Verify AI — Application Root
 * Copyright (c) 2026 Dr. Ahmed Mohamed Ibrahim. All rights reserved.
 * https://elevationtechnology.org | info@elevationtechnology.org
 * LinkedIn: https://www.linkedin.com/in/ahmedibrahimno1/
 * Live: https://label-verify-ai.pages.dev
 */

import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import UploadZone from './components/UploadZone.jsx';
import AppDataForm from './components/AppDataForm.jsx';
import ProcessingView from './components/ProcessingView.jsx';
import ResultsView from './components/ResultsView.jsx';
import { useLabelProcessor } from './hooks/useLabelProcessor.js';
import './index.css';

const VIEWS = { UPLOAD: 'upload', APPDATA: 'appdata', PROCESSING: 'processing', RESULTS: 'results' };

export default function App() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [fileEntries, setFileEntries] = useState([]);
  const [appDataSnapshot, setAppDataSnapshot] = useState({});

  const { queue, statusMap, resultMap, phase, enqueue, process, cancel, reset } = useLabelProcessor();

  const handleFilesChange = useCallback((entries) => {
    setFileEntries(entries);
    enqueue(entries);
  }, [enqueue]);

  const handleProceed = useCallback(() => {
    setView(VIEWS.APPDATA);
  }, []);

  const handleAnalyze = useCallback(async (appData) => {
    setAppDataSnapshot(appData);
    setView(VIEWS.PROCESSING);
    await process(appData);
    setView(VIEWS.RESULTS);
  }, [process]);

  const handleCancel = useCallback(() => {
    cancel();
    setView(VIEWS.UPLOAD);
  }, [cancel]);

  const handleNewAnalysis = useCallback(() => {
    const previews = fileEntries.map(e => e.preview).filter(Boolean);
    reset(previews);
    setFileEntries([]);
    setAppDataSnapshot({});
    setView(VIEWS.UPLOAD);
  }, [fileEntries, reset]);

  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">
        {view === VIEWS.UPLOAD && (
          <UploadZone
            entries={fileEntries}
            onChange={handleFilesChange}
            onProceed={handleProceed}
          />
        )}
        {view === VIEWS.APPDATA && (
          <AppDataForm
            files={queue}
            onAnalyze={handleAnalyze}
            onBack={() => setView(VIEWS.UPLOAD)}
          />
        )}
        {view === VIEWS.PROCESSING && (
          <ProcessingView
            files={queue}
            statusMap={statusMap}
            onCancel={handleCancel}
          />
        )}
        {view === VIEWS.RESULTS && (
          <ResultsView
            files={queue}
            resultMap={resultMap}
            statusMap={statusMap}
            appData={appDataSnapshot}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
