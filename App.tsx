
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Customer, Order, ActionLog, AppBackup } from './types';
import { ProductManager } from './components/ProductManager';
import { OrderManager } from './components/OrderManager';
import { CustomerManager } from './components/CustomerManager';
import { 
  LayoutDashboard, ShoppingBag, Users, Monitor, HardDrive, 
  DownloadCloud, Save, Upload, ShieldCheck, Database, HelpCircle, X, Terminal, Globe, Github
} from 'lucide-react';

const APP_VERSION = "2.5.0-Native";

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
    const savedProducts = localStorage.getItem('psh_products');
    const savedCustomers = localStorage.getItem('psh_customers');
    const savedOrders = localStorage.getItem('psh_orders');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedOrders) setOrders(JSON.parse(savedOrders));

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
      
      {/* 发布指南弹窗 */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-600" /> 应用分发与发布说明
              </h3>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <section>
                <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                  <Github className="w-4 h-4 text-slate-900" /> 方式一：免费发布到 GitHub Pages
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-2">
                  <p>1. 创建 GitHub 仓库并上传本程序所有文件。</p>
                  <p>2. 在仓库 <b>Settings -> Pages</b> 中开启服务。</p>
                  <p>3. 任何人访问生成的网址，即可通过浏览器直接使用并安装到桌面。</p>
                  <p className="text-indigo-600 font-bold">优点：零成本，全球可用，自动获得离线运行能力。</p>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                  <Terminal className="w-4 h-4 text-indigo-500" /> 方式二：打包为本地 EXE
                </h4>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 space-y-2">
                  <p># 确保已安装 Node.js 后执行：</p>
                  <p>1. <span className="text-white">npm install</span> <span className="text-slate-500">// 安装环境</span></p>
                  <p>2. <span className="text-white">npm run build</span> <span className="text-slate-500">// 生成安装包</span></p>
                  <p>3. 在 <span className="text-emerald-400">dist/</span> 目录获取 exe 文件分发给用户。</p>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                  <Globe className="w-4 h-4 text-emerald-500" /> 方式三：直接发送 ZIP 包
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  您可以将本文件夹压缩为 ZIP 发给他人。对方解压后双击 <code className="bg-slate-100 px-1 rounded">index.html</code> 即可直接运行。
                </p>
              </section>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <b>关于数据安全：</b> 无论采用哪种发布方式，本程序的所有数据（商品、客户、订单）均<b>仅存储在用户自己的电脑浏览器中</b>，绝不上传到任何服务器，隐私安全 100% 掌握。
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
              <button onClick={() => setShowGuide(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">关闭说明</button>
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
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">本地原生版</p>
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
          <button 
            onClick={() => setShowGuide(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 py-3 rounded-xl text-xs font-bold transition-all"
          >
            <HelpCircle className="w-4 h-4" /> 发布与分发说明
          </button>

          {isInstallable && (
            <button 
              onClick={handleInstall} 
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg animate-pulse"
            >
              <DownloadCloud className="w-4 h-4" /> 安装到电脑桌面
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={exportBackup} className="flex flex-col items-center p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <Save className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] mt-1 text-slate-400 font-bold">备份数据</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] mt-1 text-slate-400 font-bold">还原数据</span>
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> 安全脱机运行
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 leading-tight">
              <Database className="w-3 h-3" /> 数据状态: 仅本地可见
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 no-print">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'orders' ? '订单管理' : activeTab === 'products' ? '商品配置' : '地址管理'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">100% 离线</span>
               <span className="text-slate-400 text-xs">V{APP_VERSION}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
             <HardDrive className="w-4 h-4 text-slate-400" />
             <span className="text-[10px] font-bold text-slate-600 uppercase">私域本地引擎</span>
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
