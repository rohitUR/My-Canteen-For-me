import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Server
} from 'lucide-react';
import { 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_SQL_SCHEMA,
  fetchOrdersFromSupabase
} from '../services/supabaseClient';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordersCount: number;
  onSyncRefresh?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  ordersCount,
  onSyncRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const orders = await fetchOrdersFromSupabase();
      if (orders !== null) {
        setTestResult(`Connected! Found ${orders.length} orders in public.orders table.`);
      } else {
        setTestResult('API connected! (If you have not run the SQL table schema yet, copy and execute the script below).');
      }
      if (onSyncRefresh) onSyncRefresh();
    } catch (err: any) {
      setTestResult(`Connection response: ${err?.message || 'Ready'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-modal-title"
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="supabase-modal-title" className="font-bold text-stone-900 text-base">
                  Supabase Database Sync
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Orders are automatically saved & synced to your Supabase project
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Project Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Project ID
              </span>
              <span className="font-mono font-bold text-stone-900 text-xs block mt-0.5">
                {SUPABASE_PROJECT_ID}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Target Table
              </span>
              <span className="font-mono font-bold text-emerald-700 text-xs block mt-0.5">
                public.orders
              </span>
            </div>
          </div>

          {/* Test connection button */}
          <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div>
              <span className="font-bold text-emerald-950 block">Auto-Sync Enabled</span>
              <p className="text-[11px] text-emerald-800">
                Every placed order is transmitted to Supabase with token, items, and payments.
              </p>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Sync'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3 bg-stone-100 rounded-lg text-stone-800 text-[11px] font-mono border border-stone-200">
              {testResult}
            </div>
          )}

          {/* SQL Table Creation Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">Supabase SQL Table Schema</span>
                <p className="text-[11px] text-stone-500">
                  If you haven't created the table in Supabase yet, run this in your Supabase SQL Editor:
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 leading-relaxed border border-stone-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Current orders stored: <strong>{ordersCount}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
