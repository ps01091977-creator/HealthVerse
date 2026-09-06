import React from 'react';
import { 
  Stethoscope, 
  Lightbulb, 
  UserCheck, 
  AlertTriangle, 
  Calendar, 
  ClipboardList, 
  Info, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

/**
 * Formats inline Markdown elements like **bold**, *italic*, `code`, and [links](url)
 */
export const formatInlineText = (text) => {
  if (!text) return null;

  // Split by inline markdown patterns: **bold**, *italic*, `code`
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Match bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Match inline code `code`
    const codeMatch = remaining.match(/`(.+?)`/);
    // Match italic *text*
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

    // Find the earliest match
    let earliestIndex = -1;
    let matchType = null;
    let match = null;

    if (boldMatch && (earliestIndex === -1 || boldMatch.index < earliestIndex)) {
      earliestIndex = boldMatch.index;
      matchType = 'bold';
      match = boldMatch;
    }
    if (codeMatch && (earliestIndex === -1 || codeMatch.index < earliestIndex)) {
      earliestIndex = codeMatch.index;
      matchType = 'code';
      match = codeMatch;
    }
    if (italicMatch && (earliestIndex === -1 || italicMatch.index < earliestIndex)) {
      earliestIndex = italicMatch.index;
      matchType = 'italic';
      match = italicMatch;
    }

    if (earliestIndex === -1 || !match) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    // Add text before match
    if (earliestIndex > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, earliestIndex)}</span>);
    }

    // Add styled match
    if (matchType === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-zinc-950 dark:text-white tracking-wide">
          {match[1]}
        </strong>
      );
    } else if (matchType === 'code') {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 text-xs font-mono border border-zinc-200 dark:border-zinc-700">
          {match[1]}
        </code>
      );
    } else if (matchType === 'italic') {
      parts.push(
        <em key={key++} className="italic text-zinc-700 dark:text-zinc-300">
          {match[1]}
        </em>
      );
    }

    remaining = remaining.slice(earliestIndex + match[0].length);
  }

  return parts;
};

/**
 * Returns an appropriate icon based on section header title
 */
const getSectionIcon = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('clinical') || lower.includes('overview') || lower.includes('symptom') || lower.includes('triage') || lower.includes('analysis')) {
    return <Stethoscope className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
  }
  if (lower.includes('care') || lower.includes('step') || lower.includes('management') || lower.includes('immediate') || lower.includes('home')) {
    return <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
  }
  if (lower.includes('specialist') || lower.includes('doctor') || lower.includes('consultation') || lower.includes('recommend')) {
    return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.includes('slot') || lower.includes('schedule') || lower.includes('appointment') || lower.includes('timing')) {
    return <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  }
  if (lower.includes('prepare') || lower.includes('checklist') || lower.includes('guide')) {
    return <ClipboardList className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
  }
  if (lower.includes('alert') || lower.includes('emergency') || lower.includes('warning')) {
    return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
  }
  return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
};

/**
 * FormattedAiMessage Component - Renders AI clinical responses in a readable, structured medical layout
 */
const FormattedAiMessage = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text into paragraphs/sections
  const lines = text.split('\n');
  const renderedElements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`list-${listKey++}`} className="space-y-2 my-2.5 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-indigo-400 mt-2 flex-shrink-0" />
              <div className="flex-1">{formatInlineText(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Horizontal Rule or Divider
    if (line === '---' || line === '***') {
      flushList();
      renderedElements.push(
        <hr key={`hr-${i}`} className="my-3 border-zinc-200 dark:border-zinc-800" />
      );
      continue;
    }

    // Disclaimer Block
    if (line.toLowerCase().includes('disclaimer:') || line.startsWith('*Disclaimer') || line.startsWith('_Disclaimer')) {
      flushList();
      const disclaimerContent = line.replace(/^\*+|_|\*+$|_$/g, '').replace(/Disclaimer:\s*/i, '');
      renderedElements.push(
        <div 
          key={`disclaimer-${i}`} 
          className="mt-3 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed flex items-start space-x-2"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-800 dark:text-amber-300 block mb-0.5">Medical Safety Disclaimer:</span>
            {formatInlineText(disclaimerContent)}
          </div>
        </div>
      );
      continue;
    }

    // Emergency / Severe Warning
    if (line.startsWith('⚠️') || line.toLowerCase().includes('emergency room') || line.toLowerCase().includes('call 112') || line.toLowerCase().includes('call 911') || line.toLowerCase().includes('call 108')) {
      flushList();
      renderedElements.push(
        <div 
          key={`warn-${i}`} 
          className="my-2.5 p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs sm:text-sm leading-relaxed flex items-start space-x-2.5 shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 font-medium">{formatInlineText(line.replace(/^⚠️\s*/, ''))}</div>
        </div>
      );
      continue;
    }

    // Section Headings (### or ## or #)
    if (line.startsWith('#')) {
      flushList();
      const cleanTitle = line.replace(/^#+\s*/, '').replace(/^[🩺💡👨‍⚕️⚠️📅📋]\s*/, '').trim();
      renderedElements.push(
        <div 
          key={`heading-${i}`} 
          className="mt-4 mb-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 first:mt-0 first:pt-0 first:border-0 flex items-center space-x-2"
        >
          <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center">
            {getSectionIcon(cleanTitle)}
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-primary dark:text-indigo-300 tracking-wide uppercase">
            {cleanTitle}
          </h4>
        </div>
      );
      continue;
    }

    // Bullet Points (* item, - item, • item)
    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
      const itemText = line.replace(/^[\*\-•]\s+/, '');
      currentList.push(itemText);
      continue;
    }

    // Numbered List (1. item, 2. item)
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      renderedElements.push(
        <div key={`num-${i}`} className="flex items-start space-x-2.5 my-1.5 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          <span className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-300 border border-primary/20 dark:border-primary/30 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1">{formatInlineText(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Regular Paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 my-1.5">
        {formatInlineText(line)}
      </p>
    );
  }

  flushList();

  return (
    <div className={`space-y-1 text-zinc-800 dark:text-zinc-200 ${className}`}>
      {renderedElements}
    </div>
  );
};

export default FormattedAiMessage;
