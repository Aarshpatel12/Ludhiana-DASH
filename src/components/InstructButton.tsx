"use client";

import React, { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function InstructButton({ officerName, dataSummary, flaggedRows }: { officerName: string, dataSummary: any, flaggedRows?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInstruct = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/instruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName, dataSummary, flaggedRows })
      });
      
      if (!res.ok) throw new Error('Failed to send instruction');
      
      const data = await res.json();
      if (data.aiMessage) {
        const waUrl = `https://wa.me/919555059976?text=${encodeURIComponent(data.aiMessage)}`;
        window.open(waUrl, '_blank');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to send WhatsApp instruction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleInstruct}
      disabled={loading || success}
      className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition-colors shadow-sm print:hidden text-sm
        ${success 
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
        }
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : success ? (
        <MessageCircle className="w-4 h-4 text-emerald-500" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      {loading ? 'Preparing Message...' : success ? 'Redirected!' : 'Instruct via WhatsApp'}
    </button>
  );
}
