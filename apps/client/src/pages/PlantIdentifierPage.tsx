import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import {
  Upload,
  Camera,
  Clipboard,
  Loader2,
  Leaf,
  Sun,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { sampleResults, type PlantAnalysisResult } from '@/data/plant-data';

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'done';

function CareCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const color =
    confidence >= 90 ? 'bg-emerald-500' : confidence >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Confidence</span>
        <span className="font-medium">{confidence}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

function ResultsView({
  result,
  imagePreview,
  onReset,
}: {
  result: PlantAnalysisResult;
  imagePreview: string;
  onReset: () => void;
}) {
  const careLevelColor: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    Expert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header with image and identification */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-48 shrink-0">
          <img
            src={imagePreview}
            alt="Analyzed plant"
            className="w-full aspect-square rounded-xl object-cover border"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold">{result.name}</h2>
              <Badge className={careLevelColor[result.careLevel]}>{result.careLevel} Care</Badge>
            </div>
            <p className="text-sm text-muted-foreground italic mt-0.5">{result.scientificName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Family: {result.family}</p>
          </div>
          <ConfidenceMeter confidence={result.confidence} />
          <p className="text-sm leading-relaxed">{result.description}</p>
        </div>
      </div>

      <Separator />

      {/* Care Guide */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Care Guide</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <CareCard icon={Sun} label="Sunlight" value={result.sunlight} />
          <CareCard icon={Droplets} label="Watering" value={result.watering} />
          <CareCard icon={Thermometer} label="Temperature" value={result.temperature} />
          <CareCard icon={Wind} label="Humidity" value={result.humidity} />
        </div>
      </div>

      {/* Toxicity */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">Pet Safety</span>
        </div>
        <p className="text-sm text-muted-foreground">{result.toxicity}</p>
      </div>

      {/* Common Issues */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Common Issues</h3>
        <ul className="space-y-2">
          {result.commonIssues.map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Fun Facts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="text-lg font-semibold">Fun Facts</h3>
        </div>
        <ul className="space-y-2">
          {result.funFacts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500/50 shrink-0" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reset */}
      <div className="pt-2">
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          Identify Another Plant
        </Button>
      </div>
    </div>
  );
}

export function PlantIdentifierPage() {
  const [state, setState] = useState<AnalysisState>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resultKeys = Object.keys(sampleResults);

  function simulateAnalysis(imageUrl: string) {
    setImagePreview(imageUrl);
    setState('uploading');

    setTimeout(() => {
      setState('analyzing');
      setTimeout(() => {
        const randomKey = resultKeys[Math.floor(Math.random() * resultKeys.length)];
        setResult(sampleResults[randomKey]);
        setState('done');
      }, 2000);
    }, 800);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    simulateAnalysis(url);
  }

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      simulateAnalysis(url);
    }
  }, []);

  async function handlePaste() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const url = URL.createObjectURL(blob);
          simulateAnalysis(url);
          return;
        }
      }
      // If no image in clipboard, use a sample image URL for demo purposes
      simulateAnalysis(
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
      );
    } catch {
      // Fallback: use a sample image for demo
      simulateAnalysis(
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
      );
    }
  }

  function handleUseSample(type: string) {
    const sampleImages: Record<string, string> = {
      monstera:
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
      succulent:
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
      fern: 'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=400&h=400&fit=crop',
    };
    setImagePreview(sampleImages[type]);
    setState('uploading');
    setTimeout(() => {
      setState('analyzing');
      setTimeout(() => {
        setResult(sampleResults[type]);
        setState('done');
      }, 2000);
    }, 800);
  }

  function handleReset() {
    setState('idle');
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">PlantLens</h1>
              <p className="text-[10px] text-muted-foreground">AI Plant Identifier</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8">
        {state === 'idle' && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Identify Any Plant Instantly
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload a photo of any plant and get detailed identification, care instructions, and
                fun facts powered by AI.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Drop your plant photo here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or use one of the options below
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                    <Upload className="mr-1.5 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <Button onClick={handlePaste} variant="outline" size="sm">
                    <Clipboard className="mr-1.5 h-4 w-4" />
                    Paste from Clipboard
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="mr-1.5 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Sample Plants */}
            <div>
              <p className="text-sm font-medium text-center mb-4">
                Or try with a sample plant
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    type: 'monstera',
                    name: 'Monstera',
                    image:
                      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200&h=200&fit=crop',
                  },
                  {
                    type: 'succulent',
                    name: 'Succulent',
                    image:
                      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=200&h=200&fit=crop',
                  },
                  {
                    type: 'fern',
                    name: 'Boston Fern',
                    image:
                      'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=200&h=200&fit=crop',
                  },
                ].map((sample) => (
                  <button
                    key={sample.type}
                    onClick={() => handleUseSample(sample.type)}
                    className="group rounded-lg border overflow-hidden text-left transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={sample.image}
                        alt={sample.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium">{sample.name}</p>
                      <p className="text-xs text-muted-foreground">Tap to identify</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-center mb-4">How it Works</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Upload a Photo',
                    desc: 'Take or upload a clear photo of the plant you want to identify.',
                  },
                  {
                    step: '2',
                    title: 'AI Analysis',
                    desc: 'Our AI model analyzes the image to identify the plant species.',
                  },
                  {
                    step: '3',
                    title: 'Get Results',
                    desc: 'Receive detailed care instructions, common issues, and fun facts.',
                  },
                ].map((item) => (
                  <div key={item.step} className="text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-sm font-bold">
                      {item.step}
                    </div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(state === 'uploading' || state === 'analyzing') && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Uploaded plant"
                  className="h-48 w-48 rounded-xl object-cover border shadow-sm"
                />
                {state === 'analyzing' && (
                  <div className="absolute inset-0 rounded-xl border-2 border-emerald-500 animate-pulse" />
                )}
              </div>
            )}
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
              <p className="font-medium">
                {state === 'uploading' ? 'Uploading image...' : 'Analyzing plant...'}
              </p>
              <p className="text-sm text-muted-foreground">
                {state === 'uploading'
                  ? 'Preparing your image for analysis'
                  : 'Our AI is identifying the plant species and preparing care instructions'}
              </p>
            </div>
          </div>
        )}

        {state === 'done' && result && imagePreview && (
          <ResultsView result={result} imagePreview={imagePreview} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
          PlantLens -- AI-powered plant identification. Results are for informational purposes only.
        </div>
      </footer>
    </div>
  );
}
