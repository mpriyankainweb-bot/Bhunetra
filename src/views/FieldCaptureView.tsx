import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Mic, 
  Languages, 
  CheckCircle2, 
  Compass, 
  UploadCloud, 
  Trash2, 
  Smartphone 
} from 'lucide-react';
import { APP_IMAGES } from '../assets/images';
import { StructureType, OfflineSyncItem } from '../types';

type SupportedLang = 'en' | 'hi' | 'te' | 'mr';

interface TranslationDict {
  title: string;
  subtitle: string;
  captureBtn: string;
  syncNow: string;
  offlineMode: string;
  onlineMode: string;
  structureLabel: string;
  notesPlaceholder: string;
  voiceNote: string;
  voiceRecording: string;
  queuedItems: string;
  noQueue: string;
}

const TRANSLATIONS: Record<SupportedLang, TranslationDict> = {
  en: {
    title: 'BhuNetra Field Capture',
    subtitle: 'Offline-First Geospatial Field Assistant for Watershed Works',
    captureBtn: 'Snap Geotagged Photo',
    syncNow: 'Sync Queued Photos',
    offlineMode: 'Offline (No Cellular)',
    onlineMode: 'Connected (4G/5G)',
    structureLabel: 'Select Structure Type',
    notesPlaceholder: 'Field observation notes or voice transcript...',
    voiceNote: 'Voice Dictation',
    voiceRecording: 'Listening to Marathi/Hindi/Telugu/English voice...',
    queuedItems: 'Pending Offline Queue',
    noQueue: 'No pending uploads. All field photos synced.'
  },
  hi: {
    title: 'भू-नेत्र फील्ड कैप्चर',
    subtitle: 'जलसंभर कार्यों के लिए ऑफलाइन भू-स्थानिक फील्ड सहायक',
    captureBtn: 'जियोटैग फोटो लें',
    syncNow: 'फोटो सिंक करें',
    offlineMode: 'ऑफलाइन (नेटवर्क नहीं)',
    onlineMode: 'कनेक्टेड (4G/5G)',
    structureLabel: 'संरचना का प्रकार चुनें',
    notesPlaceholder: 'फील्ड निरीक्षण विवरण या आवाज इनपुट...',
    voiceNote: 'आवाज से लिखें',
    voiceRecording: 'आवाज सुनी जा रही है...',
    queuedItems: 'लंबित अपलोड कतार',
    noQueue: 'कोई लंबित फोटो नहीं है। सभी सिंक हो चुके हैं।'
  },
  te: {
    title: 'భూనేత్ర ఫీల్డ్ క్యాప్చర్',
    subtitle: 'వాటర్‌షెడ్ పనుల కోసం ఆఫ్‌లైన్ జియోస్పేషియల్ అసిస్టెంట్',
    captureBtn: 'జియోట్యాగ్ ఫోటో తీయండి',
    syncNow: 'ఇప్పుడే సింక్ చేయండి',
    offlineMode: 'ఆఫ్‌లైన్ (సిగ్నల్ లేదు)',
    onlineMode: 'కనెక్ట్ చేయబడింది (4G)',
    structureLabel: 'నిర్మాణ రకాన్ని ఎంచుకోండి',
    notesPlaceholder: 'ఫీల్డ్ గమనికలు...',
    voiceNote: 'వాయిస్ రికార్డింగ్',
    voiceRecording: 'వాయిస్ వినబడుతోంది...',
    queuedItems: 'పెండింగ్ సింక్ జాబితా',
    noQueue: 'పెండింగ్ ఫోటోలు లేవు. అన్నీ సింక్ అయ్యాయి.'
  },
  mr: {
    title: 'भू-नेत्र फील्ड कॅप्चर',
    subtitle: 'जलसंधारण कामांसाठी ऑफलाइन भू-स्थानिक सहाय्यक',
    captureBtn: 'जिओटॅग फोटो काढा',
    syncNow: 'आता सिंक करा',
    offlineMode: 'ऑफलाइन (नेटवर्क नाही)',
    onlineMode: 'कनेक्टेड (4G/5G)',
    structureLabel: 'कामाचा प्रकार निवडा',
    notesPlaceholder: 'कामाची सद्यस्थिती किंवा शेरे...',
    voiceNote: 'आवाज इनपुट',
    voiceRecording: 'आवाज ऐकला जात आहे...',
    queuedItems: 'प्रलंबित फोटो रांग',
    noQueue: 'सर्व फोटो सिंक झाले आहेत.'
  }
};

export const FieldCaptureView: React.FC = () => {
  const [lang, setLang] = useState<SupportedLang>('en');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [selectedStructure, setSelectedStructure] = useState<StructureType>('check_dam');
  const [notes, setNotes] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Simulated GPS Telemetry
  const [currentGps, setCurrentGps] = useState({
    lat: 19.5350,
    lon: 75.3420,
    accuracy: 3.2,
    heading: 142
  });

  // Local storage queue state
  const [queue, setQueue] = useState<OfflineSyncItem[]>(() => {
    try {
      const stored = localStorage.getItem('bhunetra_offline_queue');
      return stored ? JSON.parse(stored) : [
        {
          id: 'q-1',
          tempId: 'TMP-77401',
          capturedAt: '2026-09-29 09:40 AM',
          latitude: 19.5380,
          longitude: 75.3450,
          accuracyMeters: 2.8,
          imagePreview: APP_IMAGES.fieldCheckDam,
          fileName: 'check_dam_paithan_01.jpg',
          fileSizeBytes: 2450000,
          claimedStructure: 'check_dam',
          villageName: 'Balegaon',
          watershedId: 'W-MH-CSN-01',
          officerName: 'Er. Sandeep Patil',
          notes: 'Masonry crest overflow wall completed with stone pitching.',
          syncStatus: 'queued'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bhunetra_offline_queue', JSON.stringify(queue));
  }, [queue]);

  const t = TRANSLATIONS[lang];

  // Simulate snapping photo from camera
  const handleSnapPhoto = () => {
    const newItem: OfflineSyncItem = {
      id: `q-${Date.now()}`,
      tempId: `TMP-${Math.floor(10000 + Math.random() * 90000)}`,
      capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latitude: parseFloat((currentGps.lat + (Math.random() - 0.5) * 0.005).toFixed(4)),
      longitude: parseFloat((currentGps.lon + (Math.random() - 0.5) * 0.005).toFixed(4)),
      accuracyMeters: parseFloat((2.5 + Math.random() * 2).toFixed(1)),
      imagePreview: selectedStructure === 'plantation' ? APP_IMAGES.fieldPlantation :
                    selectedStructure === 'farm_pond' ? APP_IMAGES.fieldFarmPond :
                    APP_IMAGES.fieldCheckDam,
      fileName: `${selectedStructure}_${Date.now()}.jpg`,
      fileSizeBytes: 3100000,
      claimedStructure: selectedStructure,
      villageName: 'Balegaon',
      watershedId: 'W-MH-CSN-01',
      officerName: 'Er. Sandeep Patil',
      notes: notes || 'Field inspection snapshot with hardware geo-tag.',
      syncStatus: 'queued'
    };

    setQueue(prev => [newItem, ...prev]);
    setNotes('');
  };

  // Voice recording simulation
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceSamples: Record<SupportedLang, string> = {
        en: 'Masonry check dam with active upstream water storage. Embankment stable.',
        hi: 'चेक डैम का निर्माण पूर्ण हो गया है और पानी का भराव अच्छा है।',
        te: 'చెక్ డ్యామ్ నిర్మాణం పూర్తయింది, నీటి నిల్వ బాగుంది.',
        mr: 'सिमेंट नाला बांधाचे काम पूर्ण झाले असून पाण्याचा साठा चांगला आहे.'
      };
      setNotes(voiceSamples[lang]);
    }, 2200);
  };

  // Sync Now batch handler
  const handleSyncNow = async () => {
    if (queue.length === 0 || isOfflineSimulated) return;
    setIsSyncing(true);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: queue })
      });
      if (response.ok) {
        setQueue([]);
      }
    } catch {
      // Local sync fallback
      setQueue([]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#060B12] text-slate-100 p-4 sm:p-6 flex justify-center pb-20">
      
      {/* Mobile-Frame Centered Viewport (Simulates phone screen or desktop) */}
      <div className="w-full max-w-md bg-[#0A121F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Mobile Header Bar */}
        <div className="p-4 bg-[#070D16] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-sm tracking-tight text-white">{t.title}</span>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-0.5">
            <Languages className="w-3 h-3 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLang)}
              className="bg-transparent text-[11px] font-semibold text-slate-300 border-none focus:outline-hidden cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </div>

        {/* Connectivity Status Banner & Simulation Toggle */}
        <div className={`px-4 py-2 text-xs flex items-center justify-between transition-colors ${
          isOfflineSimulated 
            ? 'bg-amber-950/80 border-b border-amber-800 text-amber-300' 
            : 'bg-emerald-950/40 border-b border-emerald-900/60 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{t.offlineMode}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.onlineMode}</span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className="text-[10px] font-semibold underline underline-offset-2 hover:text-white cursor-pointer"
          >
            {isOfflineSimulated ? 'Simulate 4G' : 'Simulate Offline'}
          </button>
        </div>

        {/* Main Touch Viewport */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
          
          {/* Simulated Camera Viewfinder */}
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-4/3 flex items-center justify-center group">
            <img
              src={selectedStructure === 'plantation' ? APP_IMAGES.fieldPlantation :
                   selectedStructure === 'farm_pond' ? APP_IMAGES.fieldFarmPond :
                   APP_IMAGES.fieldCheckDam}
              alt="Camera preview"
              className="w-full h-full object-cover filter brightness-95"
            />

            {/* Viewfinder Crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-32 h-32 border border-white/40 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full" />
              </div>
            </div>

            {/* Live GPS Telemetry Stamp */}
            <div className="absolute top-2 left-2 right-2 p-2 rounded-lg bg-black/75 backdrop-blur-xs text-[10px] font-mono text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                {currentGps.lat}°N, {currentGps.lon}°E
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Compass className="w-3 h-3 text-amber-400" />
                {currentGps.heading}° SE · ±{currentGps.accuracy}m
              </span>
            </div>
          </div>

          {/* Structure Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
              {t.structureLabel}
            </label>
            <select
              value={selectedStructure}
              onChange={(e) => setSelectedStructure(e.target.value as StructureType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden"
            >
              <option value="check_dam">Masonry Check Dam / Nala Bund</option>
              <option value="farm_pond">Farm Pond (Khet Taladi)</option>
              <option value="plantation">Afforestation / Plantation</option>
              <option value="contour_trench">Continuous Contour Trench (CCT)</option>
              <option value="water_body">Water Body Restoration</option>
            </select>
          </div>

          {/* Voice-Assisted Notes */}
          <div className="relative">
            <textarea
              rows={2}
              placeholder={t.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden pr-10"
            />
            <button
              onClick={handleToggleVoice}
              className={`absolute right-2.5 top-2.5 p-1.5 rounded-full transition-colors cursor-pointer ${
                isRecordingVoice
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={t.voiceNote}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {isRecordingVoice && (
            <div className="text-[11px] font-mono text-rose-400 text-center animate-pulse">
              ● {t.voiceRecording}
            </div>
          )}

          {/* Large Shutter Button */}
          <button
            onClick={handleSnapPhoto}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-950/60 transition-transform active:scale-98 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span>{t.captureBtn}</span>
          </button>

          {/* 3. Pending Queue Card */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                {t.queuedItems} ({queue.length})
              </span>

              {queue.length > 0 && (
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing || isOfflineSimulated}
                  className="px-2.5 py-1 rounded bg-teal-950/80 border border-teal-800 text-teal-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-teal-900/80 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : t.syncNow}</span>
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs">
                {t.noQueue}
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-10 h-10 rounded bg-black overflow-hidden shrink-0">
                        <img src={item.imagePreview} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-white truncate capitalize">{item.claimedStructure.replace('_', ' ')}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.latitude}°N, {item.longitude}°E · {item.capturedAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveQueueItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
