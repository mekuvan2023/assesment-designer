import React, { useState, useCallback, useMemo } from 'react';
import { useLanguage } from './LanguageProvider';
import { extractTopicsFromContent } from '../services/geminiService';
import { FileIcon, XIcon, CheckIcon } from './icons';

// Declare global variables from CDN scripts
declare const mammoth: any;
declare const pdfjsLib: any;
declare const PptxJs: any;

type LoadingState = 'idle' | 'parsing' | 'extracting' | 'submitting';

interface Step2ContentProps {
  testTitle: string;
  onNext: (content: string) => void;
  onUpdateTopics: (topics: string[]) => void;
  onBack: () => void;
  onClose: () => void;
}

const Stepper: React.FC<{ currentStep: number, steps: {name: string}[] }> = ({ currentStep, steps }) => (
    <div className="flex items-center">
        {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
                <React.Fragment key={step.name}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                            isActive ? 'bg-secondary text-white shadow-lg scale-110' : isCompleted ? 'bg-pink-300 text-white' : 'bg-gray-200 text-text-light'
                        }`}>
                           {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
                        </div>
                        <div className={`mt-2 text-sm text-center font-semibold ${isActive ? 'text-text-main' : 'text-text-light'}`}>
                            {step.name}
                        </div>
                    </div>
                    {stepNumber < steps.length && <div className={`flex-auto border-t-2 mx-4 transition-colors duration-500 ease-in-out ${isCompleted ? 'border-pink-300' : 'border-gray-200'}`}></div>}
                </React.Fragment>
            );
        })}
    </div>
);


const Step2Content: React.FC<Step2ContentProps> = ({ testTitle, onNext, onUpdateTopics, onBack, onClose }) => {
  const { t, language } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const isLoading = loadingState !== 'idle';

  const showToast = useCallback((message: string) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const parseFileContent = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    switch (extension) {
        case 'pdf':
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let pdfText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                pdfText += content.items.map((item: any) => item.str).join(' ');
            }
            return pdfText;
        case 'docx':
            const docxResult = await mammoth.extractRawText({ arrayBuffer });
            return docxResult.value;
        case 'ppt':
        case 'pptx':
            const pptx = new PptxJs();
            const pptxResult = await pptx.load(arrayBuffer);
            let pptxText = '';
            for (let i = 1; i <= pptxResult.slides.length; i++) {
                const slide = pptxResult.slides[i-1];
                slide.items.forEach((item: any) => {
                    if(item.text) pptxText += item.text.text + ' ';
                });
            }
            return pptxText;
        case 'txt':
        case 'md':
        case 'html':
             return new TextDecoder().decode(arrayBuffer);
        default:
            console.warn(`Unsupported file type: ${extension}. Trying to read as text.`);
            return new TextDecoder().decode(arrayBuffer);
    }
  };

  const handleExtractTopics = async () => {
    if (files.length === 0 || isLoading) return;

    setLoadingState('extracting');
    setError('');
    try {
      showToast(t('parsingFiles'));
      const fileContents = await Promise.all(files.map(file => parseFileContent(file)));
      const combinedContent = fileContents.join('\n\n---\n\n');
      
      if (combinedContent.trim()) {
        const topicsString = await extractTopicsFromContent(combinedContent, language);
        const topicsArray = topicsString.split(',').map(t => t.trim()).filter(Boolean);
        onUpdateTopics(topicsArray);
        showToast(t('topicsExtractedSuccess'));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during topic extraction.');
    } finally {
      setLoadingState('idle');
    }
  };


  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const acceptedExtensions = ['.pdf', '.txt', '.md', '.html', '.docx', '.pptx', '.ppt'];
    const filteredFiles = Array.from(newFiles).filter(file => acceptedExtensions.some(ext => file.name.toLowerCase().endsWith(ext)));
    
    setFiles(prev => {
        const existingNames = new Set(prev.map(f => f.name));
        const uniqueNewFiles = filteredFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...uniqueNewFiles];
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (isLoading) return;
    setError('');
    setLoadingState('submitting');
    try {
        let fileContent = '';
        if (files.length > 0) {
            setLoadingState('parsing');
            const fileContents = await Promise.all(files.map(file => parseFileContent(file)));
            fileContent = fileContents.join('\n\n---\n\n');
        }
        const combinedContent = `${fileContent}\n\n${manualText}`.trim();
        onNext(combinedContent);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while processing content.');
        setLoadingState('idle');
    }
  };
  
  const stepperSteps = useMemo(() => [
      { name: t('step1_basicInfo') },
      { name: t('step2_materials') },
      { name: t('step3_config') },
      { name: t('step4_review') },
  ], [t]);

  const subTitle = `${testTitle || 'undefined'} ${t('stepperSubtitle')}`
    .replace('{step}', '2')
    .replace('{stepName}', t('step2_materials'));

  return (
    <div className="max-w-5xl mx-auto">
        {toastMessage && (
            <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
                {toastMessage}
            </div>
        )}
        <button onClick={onClose} aria-label={t('close')} className="absolute top-6 end-6 bg-gray-700 text-white rounded-full p-2 hover:bg-gray-900 transition-colors z-10">
            <XIcon className="w-5 h-5" />
        </button>

        <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-text-main">{t('createNewTestTitle')}</h1>
            <p className="text-text-light">{subTitle}</p>
        </header>
      
        <div className="mb-8 px-4"><Stepper currentStep={2} steps={stepperSteps} /></div>

        <div className="bg-card-bg p-8 rounded-2xl shadow-sm space-y-8">
            {/* Upload Section */}
            <section>
                <h2 className="text-xl font-bold text-text-main mb-2">{t('uploadMaterialsOptional')}</h2>
                <div 
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                    className={`mt-1 flex flex-col items-center justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
                >
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-pink-500 focus-within:outline-none">
                                <span>{t('chooseFiles')}</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={(e) => handleFiles(e.target.files)} accept=".pdf,.txt,.md,.html,.docx,.pptx,.ppt"/>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">{t('uploadHint')}</p>
                    </div>
                </div>
                {files.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-800 mb-2">{t('uploadedFiles')}</h3>
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {files.map((file, index) => (
                                <li key={`${file.name}-${index}`} className="ps-3 pe-4 py-2 flex items-center justify-between text-sm">
                                    <div className="w-0 flex-1 flex items-center">
                                        <FileIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                        <span className="ms-2 flex-1 w-0 truncate">{file.name}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile(index)} className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600">
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                         <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={handleExtractTopics}
                                disabled={loadingState === 'extracting' || files.length === 0}
                                className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {loadingState === 'extracting' ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('extractingTopics')}
                                    </>
                                ) : (
                                    t('extractTopicsButton')
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </section>
            
            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Manual Concepts Section */}
            <section>
                <h2 className="text-xl font-bold text-text-main mb-2">{t('manualConceptsOptional')}</h2>
                <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={t('manualConceptsPlaceholder')}
                    className="w-full p-3 h-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <p className="mt-2 text-sm text-text-light">{t('manualConceptsDesc')}</p>
            </section>

            {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
        </div>
        
        <div className="mt-10 flex justify-between items-center">
            <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-text-light font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
                {t('back')}
            </button>
            <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-secondary to-orange-400 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:scale-100"
            >
                {t('next')} →
            </button>
        </div>
    </div>
  );
};

export default Step2Content;