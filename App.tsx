
import React, { useState, useRef, useEffect } from 'react';
import { UserInput, ExhibitData } from './types';
import { generateExhibitData } from './geminiService';
import { LOADING_MESSAGES, STAT_LABELS, INPUT_PLACEHOLDERS } from './constants';
import { downloadAsImage } from './utils';

// Sub-component: StatsBar
const StatsBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{label}</span>
        <span className="text-[10px] font-bold text-gray-500">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#2c5e2e] to-[#8bc34a] transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

// Sub-component: Signboard
const Signboard: React.FC<{ data: ExhibitData; userName: string }> = ({ data, userName }) => (
  <div className="p-6 bg-[#fcfaf5]">
    <div className="border-[10px] border-[#3e2723] bg-white rounded-md shadow-2xl overflow-hidden">
      <div className="bg-[#2c5e2e] text-white p-4 md:p-6 flex justify-between items-center">
        <span className="text-[10px] md:text-xs tracking-widest bg-white/10 px-3 py-1 rounded">{data.classification}</span>
        <span className="font-extrabold text-[#ffeb3b] text-sm md:text-base">危険度：{data.dangerLevel}</span>
      </div>
      <div className="p-8 md:p-12">
        <div className="border-b-4 border-gray-50 pb-4 mb-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-1">{userName}</h2>
          <p className="text-sm md:text-lg italic text-gray-400 font-serif">{data.scientificName}</p>
        </div>
        <div className="relative bg-[#fdfdfd] border border-gray-100 p-6 md:p-8 rounded-2xl mb-8">
          <span className="absolute -top-3.5 left-6 bg-[#2c5e2e] text-white px-4 py-1 rounded-full font-bold text-[10px] uppercase">飼育員による解説</span>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{data.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsBar label={STAT_LABELS.stamina} value={data.stats.stamina} />
          <StatsBar label={STAT_LABELS.intelligence} value={data.stats.intelligence} />
          <StatsBar label={STAT_LABELS.laziness} value={data.stats.laziness} />
          <StatsBar label={STAT_LABELS.charm} value={data.stats.charm} />
        </div>
        <div className="bg-yellow-50 rounded-2xl p-6 flex gap-4 items-start">
          <span className="text-xl">💡</span>
          <div>
            <strong className="text-[#ef6c00] block mb-1">豆知識</strong>
            <p className="text-gray-700 text-sm md:text-base">{data.funFact}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [input, setInput] = useState<UserInput>({ name: '', hobby: '', worry: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExhibitData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const signboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateExhibitData(input);
      setResult(data);
    } catch (err) {
      setError("飼育データの解析に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!signboardRef.current) return;
    const btn = document.getElementById('downloadBtn');
    if (btn) btn.innerText = "🎨 書き出し中...";
    const success = await downloadAsImage(signboardRef.current, `zoo_exhibit_${Date.now()}.png`);
    if (!success) alert("画像の保存に失敗しました。");
    if (btn) btn.innerText = "🖼️ 解説看板を画像として保存";
  };

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#2c5e2e] focus:ring-4 focus:ring-[#2c5e2e]/10 outline-none transition-all shadow-sm";

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#2c5e2e] to-[#558b2f] bg-clip-text text-transparent leading-tight">
          もしもあなたが動物園で<br />飼育されていたら！？
        </h1>
        <div className="flex items-center justify-center gap-4 text-gray-400 font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
          <div className="h-[1px] w-8 bg-gray-200" />
          AI Official Exhibit Creator
          <div className="h-[1px] w-8 bg-gray-200" />
        </div>
      </header>

      <main className="w-full max-w-2xl">
        {!result && !isLoading && (
          <section className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[32px] shadow-2xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-bold text-gray-700 text-sm"><span className="text-[#8bc34a] text-xl">•</span>展示名（あなたのお名前）</label>
                <input type="text" required placeholder={INPUT_PLACEHOLDERS.name} className={inputClasses} value={input.name} onChange={(e) => setInput({ ...input, name: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-bold text-gray-700 text-sm"><span className="text-[#8bc34a] text-xl">•</span>生態的特徴（特技・趣味・好きなもの）</label>
                <input type="text" required placeholder={INPUT_PLACEHOLDERS.hobby} className={inputClasses} value={input.hobby} onChange={(e) => setInput({ ...input, hobby: e.target.value })} />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-bold text-gray-700 text-sm"><span className="text-[#8bc34a] text-xl">•</span>最近観測された行動（悩み・近況）</label>
                <textarea required rows={3} placeholder={INPUT_PLACEHOLDERS.worry} className={inputClasses} value={input.worry} onChange={(e) => setInput({ ...input, worry: e.target.value })} />
              </div>
              <button type="submit" className="w-full py-5 bg-gradient-to-br from-[#2c5e2e] to-[#3a7a3d] text-white font-extrabold text-lg rounded-2xl shadow-lg hover:-translate-y-1 transition-transform">看板をデザインする</button>
            </form>
          </section>
        )}

        {isLoading && (
          <div className="py-20 flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 border-4 border-[#e8f5e9] border-t-[#2c5e2e] rounded-full animate-spin mb-8" />
            <p className="font-bold text-[#2c5e2e] text-lg text-center px-4">{LOADING_MESSAGES[loadingMsgIdx]}</p>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mb-8 text-center font-bold">{error}</div>}

        {result && (
          <div className="space-y-8">
            <div ref={signboardRef}><Signboard data={result} userName={input.name} /></div>
            <div className="space-y-4 px-4">
              <button id="downloadBtn" onClick={handleDownload} className="w-full py-5 bg-gradient-to-br from-[#5d4037] to-[#795548] text-white font-extrabold text-lg rounded-2xl shadow-lg hover:-translate-y-1 transition-transform flex items-center justify-center gap-3">🖼️ 解説看板を画像として保存</button>
              <button onClick={() => setResult(null)} className="w-full py-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors">別の看板を作る</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
