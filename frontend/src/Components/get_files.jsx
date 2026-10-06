import { useEffect, useRef, useState } from 'react';
import Header from './Header.jsx';
import UploadSection from './UploadSection.jsx';
import LoadingAnalysis from './LoadingAnalysis.jsx';
import ResultsDashboard from './ResultsDashboard.jsx';

function GetFiles() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [view, setView] = useState('upload');
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('resumematch-theme') === 'dark' ? 'dark' : 'light';
        } catch {
            return 'light';
        }
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem('resumematch-theme', theme);
        } catch {
            return;
        }
    }, [theme]);

    const chooseFile = (selectedFile) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setError('Please choose a PDF resume to continue.');
            return;
        }
        if (selectedFile.size > 20 * 1024 * 1024) {
            setError('Your PDF is larger than 20 MB. Choose a smaller file to continue.');
            return;
        }
        setError('');
        setFile(selectedFile);
    };

    const reset = () => {
        setView('upload');
        setAnalysis(null);
        setError('');
        setFile(null);
        setJobDescription('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const analyzeResume = async (event) => {
        event.preventDefault();
        if (!file || !jobDescription.trim()) {
            setError('Add a PDF resume and the job description to start your analysis.');
            return;
        }

        setError('');
        setView('loading');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_description', jobDescription);

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiBase}/upload-resume`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.detail || data.message || 'The analysis could not be completed. Please try again.');
            }
            setAnalysis(data);
            setView('results');
        } catch (requestError) {
            setError(requestError.message || 'We could not reach the analysis service. Check your connection and try again.');
            setView('upload');
        }
    };

    return (
        <div className="app-shell" data-theme={theme}>
            <Header
                onReset={view === 'loading' || (view === 'upload' && (file || jobDescription)) ? reset : undefined}
                onHome={reset}
                theme={theme}
                onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
            />
            {view === 'upload' && (
                <UploadSection
                    file={file}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    fileInputRef={fileInputRef}
                    onFile={chooseFile}
                    onRemoveFile={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    onSubmit={analyzeResume}
                    error={error}
                />
            )}
            {view === 'loading' && <LoadingAnalysis fileName={file?.name} />}
            {view === 'results' && analysis && <ResultsDashboard data={analysis} onNewAnalysis={reset} />}
            <footer className="site-footer">
                <span>SkillLens</span>
                <span>Thoughtful tools for your next career move</span>
            </footer>
        </div>
    );
}

export default GetFiles;