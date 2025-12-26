
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Customer, Order, ActionLog, AppBackup } from './types';
import { ProductManager } from './components/ProductManager';
import { OrderManager } from './components/OrderManager';
import { CustomerManager } from './components/CustomerManager';
import { 
  LayoutDashboard, ShoppingBag, Users, Monitor, HardDrive, 
  DownloadCloud, Save, Upload, ShieldCheck, Database, HelpCircle, X, Terminal, Globe, Github, Settings, MousePointer2
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
                <DownloadCloud className="w-5 h-5 text-indigo-600" /> 应用发布指引
              </h3>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <section>
                <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                  <Github className="w-4 h-4 text-slate-900" /> GitHub Pages 极速发布流程
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">上传代码</p>
                      <p className="text-xs text-slate-500">在 GitHub 新建仓库，将本项目所有文件直接上传到根目录。</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">进入设置 (Settings)</p>
                      <p className="text-xs text-slate-500">点击仓库顶部的 <b>Settings</b> ⚙️ 选项卡（通常在最右侧）。</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                    <div className="flex-1 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <p className="font-bold text-indigo-800 text-sm mb-2">配置 Pages 服务</p>
                      <div className="space-y-2 text-xs text-indigo-700">
                        <p className="flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> 点击左侧菜单栏中的 <b>Pages</b> 选项。</p>
                        <p className="flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> 找到中间的 <b>Build and deployment</b> (构建和部署) 区块。</p>
                        <p className="flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> 在 <b>Branch</b> 下拉框选择 <b>main</b> (或 master)。</p>
                        <p className="flex items-center gap-2 font-bold"><MousePointer2 className="w-3 h-3" /> 点击旁边的 <b>Save</b> (保存) 按钮。</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">获取链接</p>
                      <p className="text-xs text-slate-500">刷新页面，上方会出现绿色横条提示你的网站已发布，点击链接即可访问。</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <b>提示：</b> 发布完成后，任何人打开该链接都可以使用工具。由于数据保存在各自浏览器内，您不用担心自己的客户信息会被其他使用者看到。
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
            <HelpCircle className="w-4 h-4" /> 发布与分发指引
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
