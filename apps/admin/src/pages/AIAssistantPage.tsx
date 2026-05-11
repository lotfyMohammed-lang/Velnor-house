import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  History,
  Lightbulb,
  Loader2,
  PieChart,
  RefreshCcw,
  Send,
  Sparkles,
  Table as TableIcon,
  TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

import { aiApi } from '@/api/ai.api';
import type { AIResult } from '@/api/ai.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AIAssistantPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai_query_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ai_query_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const quickActions = [
    { label: 'Today Sales', query: 'Show me sales report for today', icon: Calendar },
    { label: 'Weekly Profit', query: 'What is our total profit this week?', icon: PieChart },
    { label: 'Low Stock', query: 'Which products have low stock?', icon: AlertTriangle },
    { label: 'Top Products', query: 'What is the best selling perfume this month?', icon: Sparkles },
    { label: 'Underperforming', query: 'Which products are not selling well?', icon: TrendingUp },
    { label: 'Top Customers', query: 'Who is our top customer this month?', icon: ChevronRight },
  ];

  const handleQuery = async (customQuery?: string) => {
    const finalQuery = (customQuery ?? query).trim();

    if (!finalQuery || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await aiApi.query(finalQuery);
      setResult(data);
      setQuery(finalQuery);

      setHistory((prev) => {
        const next = [finalQuery, ...prev.filter((item) => item !== finalQuery)];
        return next.slice(0, 10);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get answer from AI';
      console.error('AI Query Error:', error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = async () => {
    if (!result) return;

    const text = [
      result.title ?? 'AI Result',
      '',
      result.summary || result.content || '',
      '',
      ...(result.metrics?.length
        ? ['Metrics:', ...result.metrics.map((metric) => `${metric.label}: ${metric.value}`)]
        : []),
      '',
      ...(result.recommendations?.length
        ? ['Recommendations:', ...result.recommendations.map((rec) => `- ${rec}`)]
        : []),
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Summary copied to clipboard');
    } catch {
      toast.error('Failed to copy summary');
    }
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    if (!result) return;

    const safeFileName = (result.title || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/(^-|-$)/g, '');

    if (type === 'excel') {
      const rows: (string | number)[][] = [];

      rows.push(['REPORT INFORMATION']);
      rows.push(['Title', result.title || 'AI Report']);
      rows.push(['Generated On', new Date().toLocaleString()]);
      rows.push(['Summary', result.summary || result.content || '']);
      rows.push([]);

      if (result.metrics?.length) {
        rows.push(['KEY METRICS']);
        rows.push(['Metric', 'Value']);
        result.metrics.forEach((metric) => rows.push([metric.label, metric.value]));
        rows.push([]);
      }

      if (result.items?.length) {
        rows.push(['RANKING / ITEMS']);
        rows.push(['Name', 'Value', 'Subtitle', 'Status']);
        result.items.forEach((item) =>
          rows.push([
            item.name || item.title || '',
            item.value || '',
            item.subtitle || '',
            item.status || '',
          ]),
        );
        rows.push([]);
      }

      if (result.details?.length) {
        const first = result.details[0] as Record<string, unknown>;
        const headers = Object.keys(first);

        rows.push(['DETAILS']);
        rows.push(headers);

        result.details.forEach((detail) => {
          rows.push(headers.map((header) => String((detail as Record<string, unknown>)[header] ?? '')));
        });
        rows.push([]);
      }

      if (result.recommendations?.length) {
        rows.push(['RECOMMENDATIONS']);
        rows.push(['Recommendation']);
        result.recommendations.forEach((rec) => rows.push([rec]));
      }

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      worksheet['!cols'] = [{ wch: 24 }, { wch: 36 }, { wch: 24 }, { wch: 20 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `${safeFileName || 'report'}.xlsx`);
      toast.success('Excel file exported successfully');
      return;
    }

    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 print:p-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <Sparkles className="h-8 w-8 text-[#ff4b2b]" />
            Business Intelligence
          </h1>
          <p className="mt-1 text-muted-foreground">
            Smart reports and data analysis for Velnor House.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={!result || isLoading}
            type="button"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={!result || isLoading}
            type="button"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">{result?.title || 'Business Intelligence Report'}</h1>
        <p className="text-zinc-500">
          BI Report • Generated by AI Assistant • {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card className="relative overflow-hidden border-none bg-zinc-900 text-white shadow-2xl print:hidden">
        <CardContent className="p-4 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold">How can I help you grow today?</h3>
            {result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copySummary}
                className="text-zinc-400 hover:text-white shrink-0"
                type="button"
              >
                <Copy className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Copy Summary</span>
              </Button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleQuery();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Ask about revenue, stock..."
                className="h-14 sm:h-16 border-white/20 bg-white/10 pl-12 pr-4 text-base sm:text-lg text-white placeholder:text-zinc-500 focus-visible:ring-[#ff4b2b]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                name="ai-query"
                id="ai-query"
              />
            </div>

            <Button
              type="submit"
              className="h-14 sm:h-16 px-6 sm:px-10 text-lg font-bold bg-[#ff4b2b] hover:bg-[#ff416c] shrink-0"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-6 w-6" />
                  <span className="sm:hidden">Ask AI</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 flex flex-wrap gap-x-4 gap-y-3">
            {history.length > 0 && (
              <Badge variant="secondary" className="bg-zinc-800 px-3 py-1 text-zinc-400">
                <History className="mr-1 h-3 w-3" />
                Recent
              </Badge>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {history.slice(0, 3).map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => void handleQuery(item)}
                  className="text-xs text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-200"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="sm:ml-auto flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => void handleQuery(action.query)}
                  className="text-xs font-bold text-[#ff4b2b] transition-opacity hover:opacity-80"
                >
                  #{action.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 print:hidden">
          <CardContent className="p-4 text-sm font-medium text-red-700">{errorMessage}</CardContent>
        </Card>
      )}

      {result && (
        <div className="animate-in slide-in-from-bottom-6 space-y-6 sm:space-y-8 duration-700">
          <div className="rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-8 shadow-sm dark:bg-zinc-900">
            <Badge className="mb-4 bg-[#ff4b2b]">AI Insights</Badge>
            <h2 className="mb-4 text-xl sm:text-2xl font-bold">{result.title}</h2>
            <p className="text-base sm:text-lg italic leading-relaxed text-muted-foreground">
              "{result.summary || result.content}"
            </p>
          </div>

          {result.metrics && result.metrics.length > 0 && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
              {result.metrics.map((metric) => (
                <Card key={metric.label} className="border-none bg-zinc-50 shadow-sm dark:bg-zinc-900">
                  <CardHeader className="pb-2">
                    <CardDescription className="font-medium">{metric.label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-black tracking-tight">{metric.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 print:grid-cols-1">
            <div className="space-y-6 lg:col-span-2">
              {result.details && result.details.length > 0 && (
                <Card className="overflow-hidden rounded-xl sm:rounded-2xl border shadow-sm">
                  <CardHeader className="border-b bg-zinc-50 dark:bg-zinc-800">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TableIcon className="h-4 w-4" />
                      Detailed Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y p-0">
                    {result.details.map((detail: any, index: number) => (
                      <div
                        key={`${detail.id || detail.product || detail.customer || index}-${index}`}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-50/50"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold truncate text-sm sm:text-base">{detail.customer || detail.product || detail.id}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {detail.date || detail.reason || detail.status || ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base sm:text-lg font-black">
                            {detail.amount || detail.status || detail.value || ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.type === 'ranking' && result.items && (
                <div className="space-y-3 sm:space-y-4">
                  {result.items.map((item, index) => (
                    <Card
                      key={`${item.name || item.title || index}-${index}`}
                      className="group flex items-center overflow-hidden border-none p-0 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center bg-zinc-900 text-xl sm:text-2xl font-black text-white transition-colors group-hover:bg-[#ff4b2b]">
                        {index + 1}
                      </div>
                      <div className="flex-1 px-4 sm:px-6 min-w-0">
                        <p className="text-base sm:text-lg font-bold truncate">{item.name || item.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                      <div className="px-4 sm:px-6 text-sm sm:text-lg font-black shrink-0">{item.value}</div>
                    </Card>
                  ))}
                </div>
              )}

              {result.type === 'alert' && result.items && (
                <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                  {result.items.map((item, index) => (
                    <Card key={`${item.title || item.name || index}-${index}`} className="border-l-4 border-l-red-500 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                        <div className="min-w-0 pr-2">
                          <CardTitle className="text-sm sm:text-base truncate">{item.title || item.name}</CardTitle>
                          <CardDescription className="text-[10px] sm:text-xs truncate">{item.status}</CardDescription>
                        </div>
                        <Badge variant="destructive" className="font-bold shrink-0">
                          {item.value}
                        </Badge>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden rounded-xl sm:rounded-2xl border shadow-lg">
                <CardHeader className="border-b border-amber-500/10 bg-amber-500/10">
                  <CardTitle className="flex items-center gap-2 text-sm text-amber-700">
                    <Lightbulb className="h-4 w-4" />
                    Strategic Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <ul className="space-y-3 sm:space-y-4">
                    {(result.recommendations || [
                      'Monitor daily sales patterns.',
                      'Update inventory stock levels.',
                    ]).map((recommendation, index) => (
                      <li key={`${recommendation}-${index}`} className="group flex gap-2 text-xs sm:text-sm font-medium text-zinc-600">
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-amber-500 transition-transform group-hover:translate-x-1" />
                        <span className="leading-snug">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && !errorMessage && (
        <div className="flex flex-col items-center justify-center py-24 text-center opacity-30 print:hidden">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Sparkles className="h-12 w-12" />
          </div>
          <p className="mb-2 text-2xl font-black uppercase italic tracking-widest">Command Center</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Type your question above or use one of the quick report buttons to analyze your store data.
          </p>
        </div>
      )}
    </div>
  );
}