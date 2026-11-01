import React, { useState, useMemo, useEffect } from 'react';
import { Test, Question, BloomLevel } from '../types';
import { useLanguage } from './LanguageProvider';
import QuestionCard from './QuestionCard';

// CDN libraries are loaded in index.html and accessed via the window object.

interface Step4ReviewProps {
  test: Test;
  onUpdateQuestion: (question: Question) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onStartPractice: () => void;
  onDone: () => void;
}

const AnalyticsBar: React.FC<{label: string, value: number, count: number, color: string}> = ({label, value, count, color}) => (
    <div className="grid grid-cols-6 items-center gap-2 text-sm">
        <div className="col-span-1 font-medium text-text-light">{label}</div>
        <div className="col-span-4 bg-gray-200 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{width: `${value}%`}}></div>
        </div>
        <div className="col-span-1 text-right font-semibold text-text-main">{count}</div>
    </div>
);


const Step4Review: React.FC<Step4ReviewProps> = ({ test, onUpdateQuestion, onAddQuestion, onDeleteQuestion, onStartPractice, onDone }) => {
  const { t } = useLanguage();
  const [testSaved, setTestSaved] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTestSaved(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);
  
  const analytics = useMemo(() => {
    const easy = test.questions.filter(q => q.bloomLevel === BloomLevel.EASY).length;
    const medium = test.questions.filter(q => q.bloomLevel === BloomLevel.MEDIUM).length;
    const hard = test.questions.filter(q => q.bloomLevel === BloomLevel.HARD).length;
    const total = test.questions.length;
    return {
        easy,
        medium,
        hard,
        total,
        easyPct: total > 0 ? Math.round((easy / total) * 100) : 0,
        mediumPct: total > 0 ? Math.round((medium / total) * 100) : 0,
        hardPct: total > 0 ? Math.round((hard / total) * 100) : 0,
    };
  }, [test]);
  
  const footerText = t('footerDev');

  const escapeXml = (unsafe: string | undefined): string => {
    if(!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
  };

  const exportAsJSON = () => {
    const fileSaver = (window as any).saveAs;
    if (!fileSaver) {
        alert('File saver library not loaded.');
        console.error('saveAs library not found on window object');
        return;
    }
    const dataStr = JSON.stringify({ ...test, attribution: footerText }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    fileSaver(blob, `${test.title || 'test'}.json`);
  };

  const exportAsPDF = () => {
    const jspdfModule = (window as any).jspdf;
    const html2canvasModule = (window as any).html2canvas;

    if (!jspdfModule || !html2canvasModule) {
      alert('PDF export libraries not loaded.');
      console.error('jspdf or html2canvas library not found on window object');
      return;
    }

    const input = document.getElementById('pdf-export-content');
    if (input) {
      const originalTitle = document.title;
      document.title = test.title || "test";
      input.style.display = 'block';
      html2canvasModule(input, { scale: 2, useCORS: true }).then((canvas: any) => {
        input.style.display = 'none';
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdfModule;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${document.title}.pdf`);
        document.title = originalTitle;
      });
    }
  };

  const exportAsWord = () => {
    const docxModule = (window as any).docx;
    const fileSaver = (window as any).saveAs;
    if (!docxModule || !fileSaver) {
      alert('Word export library not loaded.');
      console.error('docx or saveAs library not found on window object');
      return;
    }
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = docxModule;
    const docChildren = [
      new Paragraph({ text: test.title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    ];
    test.questions.forEach((q, index) => {
      docChildren.push(new Paragraph({
          children: [new TextRun({ text: `${index + 1}. ${q.question}`, bold: true })],
          spacing: { before: 200, after: 100 },
      }));
      q.choices.forEach((choice, choiceIndex) => {
          const isCorrect = choiceIndex === q.correctAnswerIndex;
          docChildren.push(new Paragraph({
              children: [new TextRun({
                text: `${String.fromCharCode(65 + choiceIndex)}. ${choice}`,
                ...(isCorrect && {color: "22C55E", bold: true})
              })],
              indent: { left: 400 },
          }));
      });
      docChildren.push(new Paragraph({
          children: [new TextRun({ text: `${t('explanation')}: ${q.shortExplanation}`, italics: true })],
          indent: { left: 400 },
           spacing: { before: 100, after: 100 },
      }));
    });
    docChildren.push(new Paragraph({ text: `\n\n${footerText}`, alignment: AlignmentType.CENTER, style: "footer" }));
    const doc = new Document({ styles: { paragraphStyles: [{ id: "footer", name: "Footer", run: { size: 16, color: "888888" } }] }, sections: [{ children: docChildren }] });
    Packer.toBlob(doc).then((blob: any) => fileSaver(blob, `${test.title || 'test'}.docx`));
  };
  
  const exportForMoodleAiken = () => {
    const fileSaver = (window as any).saveAs;
    if (!fileSaver) {
        alert('File saver library not loaded.');
        console.error('saveAs library not found on window object');
        return;
    }
    let aikenText = '';
    test.questions.forEach(q => {
        aikenText += `${q.question.replace(/\n/g, ' ')}\n`;
        q.choices.forEach((choice, index) => {
            aikenText += `${String.fromCharCode(65 + index)}. ${choice.replace(/\n/g, ' ')}\n`;
        });
        aikenText += `ANSWER: ${String.fromCharCode(65 + q.correctAnswerIndex)}\n\n`;
    });

    const blob = new Blob([aikenText], { type: 'text/plain;charset=utf-8' });
    fileSaver(blob, `${test.title || 'test'}-moodle-aiken.txt`);
  };
  
  const exportForTomax = () => {
    const fileSaver = (window as any).saveAs;
    if (!fileSaver) {
        alert('File saver library not loaded.');
        console.error('saveAs library not found on window object');
        return;
    }
     const tomaxQuestions = test.questions.map((q) => {
        const options = q.choices.map((choice, i) => `        <option id="${String.fromCharCode(65 + i)}">${escapeXml(choice)}</option>`).join('\n');
        return `    <question id="${escapeXml(q.id)}" type="multiple-choice">
      <stem>${escapeXml(q.question)}</stem>
      <options>
${options}
      </options>
      <correct_answer>${String.fromCharCode(65 + q.correctAnswerIndex)}</correct_answer>
      <explanation>${escapeXml(q.shortExplanation)}</explanation>
    </question>`;
    }).join('\n');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<test title="${escapeXml(test.title)}">
  <questions>
${tomaxQuestions}
  </questions>
</test>`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    fileSaver(blob, `${test.title || 'test'}-tomax.xml`);
  };

  const renderPdfContent = () => (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#1E293B' }}>
        <h1 style={{ textAlign: 'center', color: '#8B5CF6', marginBottom: '10px' }}>{test.title}</h1>
        <h2 style={{ fontSize: '1.1em', color: '#6B7280', textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
          Level: {test.learnerLevel} | {test.questions.length} Questions
        </h2>
        {test.questions.map((q, index) => (
            <div key={q.id} style={{ marginBottom: '24px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{index + 1}. {q.question}</p>
                <ul style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '12px' }}>
                    {q.choices.map((choice, i) => (
                        <li key={i} style={{
                            margin: '8px 0',
                            fontWeight: i === q.correctAnswerIndex ? 'bold' : 'normal',
                            color: i === q.correctAnswerIndex ? '#16a34a' : 'inherit'
                        }}>
                            {String.fromCharCode(65 + i)}. {choice}
                        </li>
                    ))}
                </ul>
                <p style={{ marginTop: '12px', fontStyle: 'italic', backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
                    <strong>{t('explanation')}:</strong> {q.shortExplanation}
                </p>
            </div>
        ))}
        <footer style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', color: '#6B7280', fontSize: '0.9em' }}>
            {footerText}
        </footer>
    </div>
  );

  const learnerLevelDisplay = t('learnerLevels')[Object.values(test.learnerLevel || '').indexOf(test.learnerLevel || '')] || test.learnerLevel;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-text-main">{test.title || t('reviewYourTest')}</h1>
      </header>

      <div className="bg-card-bg p-6 rounded-2xl shadow-xl mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <p className="text-lg text-text-light font-semibold">Level: {learnerLevelDisplay} | {test.questions.length} Questions</p>
             {testSaved && 
                <div className="bg-teal-100 text-teal-700 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Test Saved!
                </div>
            }
        </div>
        <div className="flex flex-wrap items-start md:flex-nowrap gap-6">
            <div className="flex-grow bg-pink-50/50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-text-main mb-1">{t('testAnalytics')}</h3>
                <p className="text-sm text-text-light mb-4">{t('questionDistribution')}</p>
                <div className="space-y-3">
                    <AnalyticsBar label={t('easy')} value={analytics.easyPct} count={analytics.easy} color="bg-green-500" />
                    <AnalyticsBar label={t('medium')} value={analytics.mediumPct} count={analytics.medium} color="bg-yellow-500" />
                    <AnalyticsBar label={t('hard')} value={analytics.hardPct} count={analytics.hard} color="bg-red-500" />
                </div>
            </div>

            <div className="w-full md:w-64 flex-shrink-0">
                <h3 className="text-lg font-bold text-text-main mb-3">{t('exportOptions')}</h3>
                <div className="flex flex-col gap-2">
                    <button onClick={onStartPractice} className="w-full bg-secondary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-pink-700 transition text-sm">{t('startPractice')}</button>
                    <button onClick={exportAsWord} className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition text-sm">{t('exportAsWord')}</button>
                    <button onClick={exportAsPDF} className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition text-sm">{t('exportAsPDF')}</button>
                    <button onClick={exportForTomax} className="w-full bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition text-sm">{t('exportAsTomax')}</button>
                    <button onClick={exportForMoodleAiken} className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition text-sm">{t('exportAsMoodle')}</button>
                    <button onClick={exportAsJSON} className="w-full bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition text-sm">{t('exportAsJSON')}</button>
                    <button onClick={onDone} className="w-full mt-4 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2 text-sm">
                        ← {t('backToDashboard')}
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {test.questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            onUpdate={onUpdateQuestion}
            onDelete={onDeleteQuestion}
          />
        ))}
        {test.openEndedQuestions && test.openEndedQuestions.length > 0 && (
          <div className="bg-card-bg p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-text-main mb-4">{t('openEndedQuestionsTitle')}</h3>
            <ul className="list-decimal list-inside space-y-2 text-text-light">
              {test.openEndedQuestions.map(oq => (
                <li key={oq.id}>{oq.question}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onAddQuestion} className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-accent to-green-400 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
          {t('addQuestion')}
        </button>
      </div>

      <div id="pdf-export-content" className="hidden">
        {renderPdfContent()}
      </div>
    </div>
  );
};

export default Step4Review;