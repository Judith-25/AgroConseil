/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from './hooks/useAuth';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { useTranslation } from 'react-i18next';
import { signInWithGoogle, logout } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  CloudRain, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Warehouse, 
  ChevronRight,
  RefreshCw,
  Globe,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAgriculturalAdvice } from './lib/gemini';
import './lib/i18n';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { location, error: geoError } = useGeolocation();
  const { weather, loading: weatherLoading } = useWeather(location?.lat, location?.lng);
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'advice' | 'weather' | 'crops' | 'settings'>('advice');
  const [adviceData, setAdviceData] = useState<string>('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Maïs');

  const crops = ['Maïs', 'Manioc', 'Cacao', 'Mil', 'Sorgho', 'Igname'];

  const fetchAdvice = async (type: 'disease_prevention' | 'harvest' | 'storage') => {
    if (!location) return;
    setAdviceData('');
    setAdviceLoading(true);
    try {
      const res = await getAgriculturalAdvice({
        type,
        crop: selectedCrop,
        location: `${location.lat}, ${location.lng}`,
        weather: weather,
        language: i18n.language,
        userName: user?.displayName?.split(' ')[0]
      });
      setAdviceData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAdviceLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FDFCF9]">
        <Loader2 className="animate-spin text-emerald-700 w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCF9] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[2rem] shadow-sm border border-slate-200 p-10 text-center"
        >
          <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
            <Sprout size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 mb-2 uppercase tracking-tight">AgroConseil Afrique</h1>
          <p className="text-slate-500 mb-10 text-sm">{t('welcome_desc', 'Votre allié pour une agriculture intelligente et durable en Afrique de l\'Ouest.')}</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Globe size={18} />
            {t('login')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#FDFCF9] font-sans text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
            <Sprout size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-emerald-900 uppercase tracking-tight">
            AgroConseil <span className="text-amber-600">Afrique</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
            {['FR', 'EN', 'WO'].map(lang => (
              <button 
                key={lang}
                onClick={() => i18n.changeLanguage(lang.toLowerCase())}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${
                  i18n.language.toUpperCase().startsWith(lang) 
                    ? 'bg-white shadow-sm text-emerald-700' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user.displayName || 'Agriculteur'}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'Sikasso, Mali'} • Compte Premium
              </p>
            </div>
            <button 
              onClick={logout}
              className="w-10 h-10 rounded-full bg-slate-200 border-2 border-emerald-500 flex items-center justify-center text-slate-500 hover:text-emerald-700 transition-all overflow-hidden"
            >
              {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <LogOut size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <nav className="col-span-2 flex flex-col gap-2">
          <SidebarLink icon={<Sprout size={18} />} label="Tableau" active={activeTab === 'advice'} onClick={() => setActiveTab('advice')} />
          <SidebarLink icon={<CloudRain size={18} />} label="Météo" active={activeTab === 'weather'} onClick={() => setActiveTab('weather')} />
          <SidebarLink icon={<ShieldCheck size={18} />} label="Maladies" active={false} onClick={() => {}} />
          <SidebarLink icon={<Warehouse size={18} />} label="Stockage" active={activeTab === 'crops'} onClick={() => setActiveTab('crops')} />
          
          <div className="mt-auto">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm shadow-amber-50">
              <div className="text-amber-800 text-[10px] font-bold mb-1 uppercase tracking-wider">Mode Hors Ligne</div>
              <p className="text-amber-700 text-[10px] leading-tight opacity-70 font-medium">Synchronisé il y a 14 min. Conseils IA disponibles.</p>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="col-span-10 grid grid-cols-3 grid-rows-2 gap-6 overflow-hidden">
          
          {/* AI Advisor Card */}
          <div className="col-span-2 row-span-1 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider leading-none flex items-center">
                  IA Agriculture
                </span>
                <h2 className="text-lg font-bold text-slate-800">Conseiller Intelligent</h2>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-sm scrollbar-hide">
                {crops.map(c => (
                  <button 
                    key={c}
                    onClick={() => {
                      setSelectedCrop(c);
                      setAdviceData('');
                    }}
                    className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all whitespace-nowrap ${
                      selectedCrop === c ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <button 
                  onClick={() => {
                    const custom = prompt("Entrez le nom de votre produit (ex: Oignon, Tomate...) :");
                    if (custom) setSelectedCrop(custom);
                  }}
                  className="px-3 py-1.5 text-[9px] font-bold rounded-lg text-emerald-600 bg-emerald-50 whitespace-nowrap border border-emerald-100"
                >
                  + Autre
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
              {adviceLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                  <RefreshCw size={16} className="animate-spin text-emerald-600" />
                  {user.displayName?.split(' ')[0] || 'Moussa'}, je réfléchis à la meilleure solution pour votre culture de {selectedCrop}...
                </div>
              ) : (
                <div className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                  {adviceData ? `"${adviceData}"` : `"Bonjour ${user.displayName?.split(' ')[0] || 'Moussa'}. Vous avez sélectionné la culture : ${selectedCrop}. Choisissez un type de conseil ci-dessous pour obtenir une recommandation personnalisée selon votre position actuelle."`}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => fetchAdvice('disease_prevention')}
                className="py-3 px-4 bg-emerald-700 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-800 transition-all uppercase tracking-wider flex items-center justify-center gap-2 flex-1"
              >
                <ShieldCheck size={14} /> Prévention
              </button>
              <button 
                onClick={() => fetchAdvice('harvest')}
                className="py-3 px-4 bg-amber-600 text-white text-[10px] font-bold rounded-xl hover:bg-amber-700 transition-all uppercase tracking-wider flex items-center justify-center gap-2 flex-1"
              >
                <CloudRain size={14} /> Récolte
              </button>
              <button 
                onClick={() => fetchAdvice('storage')}
                className="py-3 px-4 bg-slate-800 text-white text-[10px] font-bold rounded-xl hover:bg-slate-900 transition-all uppercase tracking-wider flex items-center justify-center gap-2 flex-1"
              >
                <Warehouse size={14} /> Stockage
              </button>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="col-span-1 row-span-1 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-50">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mb-1">Météo Locale</p>
                <h3 className="text-4xl font-bold font-sans">
                  {weatherLoading ? '...' : `${weather?.temp}°C`}
                </h3>
                <p className="text-[12px] text-emerald-100 font-medium">
                  {location ? `Position : ${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'Sikasso, Mali'}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
                <CloudRain size={28} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Humidité Sol</p>
                <p className="text-xl font-bold">{weatherLoading ? '...' : `64%`}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Précipitations</p>
                <p className="text-xl font-bold">12%</p>
              </div>
            </div>
          </div>

          {/* Map/Geoloc Widget */}
          <div className="col-span-1 row-span-1 bg-white border border-slate-200 rounded-[2rem] overflow-hidden relative shadow-sm">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-bold border border-slate-200 shadow-sm text-slate-600 uppercase tracking-tight">
                COORD: {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° W` : 'RECHERCHE...'}
              </span>
            </div>
            <div className="w-full h-full bg-[#E5E2D0] relative flex flex-col">
              <div className="flex-1 relative">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#666 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white p-4 border-t border-slate-100 shrink-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Zone Actuelle</p>
                <p className="text-[12px] font-bold text-slate-800">Région Fertile de Kénédougou</p>
              </div>
            </div>
          </div>

          {/* Post-Harvest & Durability Tips */}
          <div className="col-span-2 row-span-1 bg-amber-50 border border-amber-200 rounded-[2rem] p-6 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md">
                  <Warehouse size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Conservation des Récoltes</h3>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Optimiser la durabilité</p>
                </div>
             </div>
             <div className="grid grid-cols-3 gap-4 flex-1">
                <StorageCard type="MIL & SORGHO" text="Séchage à moins de 12% d'humidité avant stockage." color="amber" />
                <StorageCard type="FRUITS" text="Utilisez des caisses aérées pour éviter la chaleur." color="emerald" />
                <StorageCard type="TUBERCULES" text="Conserver à l'abri de la lumière dans du sable sec." color="slate" />
             </div>
             <button className="mt-4 w-full py-2.5 bg-amber-200 text-amber-800 text-[10px] font-bold rounded-xl hover:bg-amber-300 transition-colors uppercase tracking-[0.1em]">
                Voir le guide de stockage complet
             </button>
          </div>

        </div>
      </main>
      
      <footer className="h-10 px-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">© 2024 AgriConseil Afrique</span>
          <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">• Réseau Connecté</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Systèmes Opérationnels</span>
        </div>
      </footer>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
        active 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' 
          : 'text-slate-400 hover:bg-slate-50 border-transparent hover:border-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StorageCard({ type, text, color }: { type: string, text: string, color: 'amber' | 'emerald' | 'slate' }) {
  const colors = {
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    slate: 'text-slate-600'
  };
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow">
      <p className={`text-[9px] font-black ${colors[color]} mb-1.5 tracking-widest`}>{type}</p>
      <p className="text-[11px] font-medium text-slate-600 leading-snug">{text}</p>
    </div>
  );
}
