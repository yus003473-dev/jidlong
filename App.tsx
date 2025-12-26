
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Customer, Order, ActionLog, AppBackup } from './types.ts';
import { ProductManager } from './components/ProductManager.tsx';
import { OrderManager } from './components/OrderManager.tsx';
import { CustomerManager } from './components/CustomerManager.tsx';
import { 
  LayoutDashboard, ShoppingBag, Users, Monitor, HardDrive, 
  DownloadCloud, Save, Upload, ShieldCheck, Database, HelpCircle, X, Terminal, Globe, Github, Settings, MousePointer2
} from 'lucide-react';

const APP_VERSION = "2.5.1-Stable";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'customers'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('psh_products');
      const savedCustomers = localStorage.getItem('psh_customers');
      const savedOrders = localStorage.getItem('psh_orders');
      
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error("Local Storage 损坏", e);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
  }, []);

  useEffect(() => localStorage.setItem('psh_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('psh_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('psh_orders', JSON.stringify(orders)), [orders]);

  const addLog = useCallback((message: string, type: ActionLog['type'] = 'INFO') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    }, ...prev].slice(0, 50));
  }, []);

  const exportBackup = () => {
    const data: AppBackup = {
      products,
      customers,
      orders,
      version: APP_VERSION,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `接龙助手_备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addLog("数据已成功导出至下载目录", "SUCCESS");
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("确定恢复备份吗？这将覆盖当前所有数据。")) {
          setProducts(data.products || []);
          setCustomers(data.customers || []);
          setOrders(data.orders || []);
          addLog("数据还原成功", "SUCCESS");
        }
      } catch (err) {
        addLog("备份文件格式错误", "ERROR");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />
      
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-600" /> 应用发布指引
              </h3>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <section>
                <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                  <Github className="w-4 h-4 text-slate-900" /> GitHub Pages 部署注意点
                </h4>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-xs leading-relaxed">
                    <strong>重要：</strong> 如果部署到 GitHub 子目录（如 /repo-name/），请确保 index.html 中的路径均为相对路径（已在当前版本优化）。
                  </div>
                  <p className="text-sm text-slate-600">直接将所有代码上传到仓库根目录，并在 Settings -> Pages 中开启服务即可。</p>
                </div>
              </section>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
              <button onClick={() => setShowGuide(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">确定</button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 p-6 flex flex-col border-r border-slate-800 no-print">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">女王接龙</h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">AI 驱动版</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { id: 'orders', icon: LayoutDashboard, label: '订单管理中心' },
            { id: 'products', icon: ShoppingBag, label: '本地商品库' },
            { id: 'customers', icon: Users, label: '客户地址簿' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6 border-t border-slate-800">
          <button onClick={() => setShowGuide(true)} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 py-3 rounded-xl text-xs font-bold transition-all">
            <HelpCircle className="w-4 h-4" /> 部署指引
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={exportBackup} className="flex flex-col items-center p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <Save className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] mt-1 text-slate-400 font-bold">备份</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] mt-1 text-slate-400 font-bold">还原</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 no-print">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'orders' ? '订单中心' : activeTab === 'products' ? '商品库' : '地址簿'}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
               <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">100% 本地运行</span>
               <span>V{APP_VERSION}</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'orders' && (
            <OrderManager 
              products={products} 
              customers={customers} 
              orders={orders} 
              setOrders={setOrders}
              logs={logs}
              addLog={addLog}
            />
          )}
          {activeTab === 'products' && <ProductManager products={products} setProducts={setProducts} />}
          {activeTab === 'customers' && <CustomerManager customers={customers} setCustomers={setCustomers} />}
        </div>
      </main>
    </div>
  );
};

export default App;
