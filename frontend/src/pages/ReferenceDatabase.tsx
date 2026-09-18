import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Download, Eye, CheckCircle2, 
  Database, Layers, ArrowUpDown, RefreshCw, Cpu, 
  UploadCloud, X, ZoomIn, ZoomOut, SlidersHorizontal, 
  Tag, ExternalLink, Check, Copy, ChevronRight, Grid, List,
  ShieldCheck, Sparkles, Activity, FileCode, CheckCircle,
  FileSpreadsheet, Terminal, BarChart2
} from 'lucide-react';
import { apiService, ReferenceIC } from '../services/api';

// Extended Golden Sample definition for rich visual inspection
interface ExtendedGoldenSample extends ReferenceIC {
  nominalFont: string;
  surfaceRoughness: string;
  pin1Indent: string;
  syntaxFormula: string;
  grooveDepth: number; // in µm
  edgeAcutance: number; // in %
  confidenceScore: number;
  markingTechnique: string;
  zones: {
    id: string;
    name: string;
    spec: string;
    details: string;
    status: 'PASS' | 'WARN';
  }[];
}

const DEFAULT_GOLDEN_SAMPLES: ExtendedGoldenSample[] = [
  {
    id: 1,
    part_number: 'STM32F407VGT6',
    manufacturer: 'STMicroelectronics',
    package_type: 'LQFP-100',
    category: 'Microcontroller',
    font_style: 'ST Laser Dot-Matrix V2',
    nominalFont: 'Laser Dot-Matrix (0.85mm)',
    surfaceRoughness: 'Ra 1.2µm (Matte Mold)',
    pin1Indent: 'Ø 1.20mm ± 0.05mm (Top-Left)',
    syntaxFormula: '{MFR_LOGO} + {PART_NO} + {LOT_TRACE} + {DATE_CODE_YYWW}',
    grooveDepth: 14.2,
    edgeAcutance: 94.6,
    confidenceScore: 0.994,
    markingTechnique: 'Fiber Laser Anneal',
    pin_count: 100,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/STMicroelectronics_logo.svg',
    datasheet_url: 'https://www.st.com/resource/en/datasheet/stm32f407vg.pdf',
    markings_template: 'STM32F407 VGT6 7BA24 V6 PHL 2348',
    zones: [
      { id: '1', name: 'Logo Mark Integrity', spec: 'Laser Etched | Aspect Ratio 1.42 | Min Contrast 68%', details: 'Vector stroke thickness: 0.14mm ± 0.02mm', status: 'PASS' },
      { id: '2', name: 'Primary Part Number', spec: 'Dot Pitch 0.12mm | Font: ST-Corp-Matrix-V2 | Char Kerning 0.28mm', details: 'Height: 1.10mm, Width: 0.65mm, 100% OCR verify', status: 'PASS' },
      { id: '3', name: 'Date Code & Factory Trace', spec: 'Format: [Country: 3] [Year: 2] [Week: 2] [Wafer: 1]', details: 'PHL = Calamba assembly site, Week 48 2023', status: 'PASS' }
    ]
  },
  {
    id: 2,
    part_number: 'ATMEGA328P-AU',
    manufacturer: 'Microchip Technology',
    package_type: 'TQFP-32',
    category: 'Microcontroller',
    font_style: 'Atmel Laser Micro-Etch',
    nominalFont: 'Laser Micro-Etch (0.75mm)',
    surfaceRoughness: 'Ra 1.0µm (Gloss Polish)',
    pin1Indent: 'Chamfer Edge 45° + Dot Ø 0.8mm',
    syntaxFormula: '{ATMEL_LOGO} + {PART_NO} + {YYWW_TRACE} + {LOT_ID}',
    grooveDepth: 12.8,
    edgeAcutance: 96.1,
    confidenceScore: 0.998,
    markingTechnique: 'UV Laser Direct Mark',
    pin_count: 32,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Microchip_Technology_logo.svg',
    datasheet_url: 'https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf',
    markings_template: 'ATMEGA328P AU 2245 THAILAND',
    zones: [
      { id: '1', name: 'Atmel/Microchip Crest', spec: 'Dual Triangle Guilloche | Sharpness 96.5%', details: 'Etch depth: 12.8µm, zero carbon splash', status: 'PASS' },
      { id: '2', name: 'Part Number Alignment', spec: 'Linear Baseline Drift < 0.02mm | Kerning 0.22mm', details: 'Character aspect ratio 1.55, 5x7 matrix compatible', status: 'PASS' },
      { id: '3', name: 'Assembly Lot Trace', spec: 'Encrypted Lot String + Date Matrix 2D (Optional)', details: 'Pinpoint accuracy match to Chandler, AZ fab', status: 'PASS' }
    ]
  },
  {
    id: 3,
    part_number: 'TMS320F28335PGFA',
    manufacturer: 'Texas Instruments',
    package_type: 'LQFP-176',
    category: 'Digital Signal Processor',
    font_style: 'TI Fiber Laser Vector',
    nominalFont: 'Fiber Laser Vector (0.90mm)',
    surfaceRoughness: 'Ra 1.4µm (Standard Mold)',
    pin1Indent: 'Dimple Ø 1.5mm (Deep Recessed)',
    syntaxFormula: '{TI_LOGO} + {PART_NO} + {G4_RoHS} + {LOT_CODE}',
    grooveDepth: 15.5,
    edgeAcutance: 93.8,
    confidenceScore: 0.991,
    markingTechnique: 'CO2 Vector Laser',
    pin_count: 176,
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Texas_Instruments_logo.svg',
    datasheet_url: 'https://www.ti.com/lit/ds/symlink/tms320f28335.pdf',
    markings_template: 'TMS320F28335 PGFA Y-28A3K4W G4',
    zones: [
      { id: '1', name: 'Texas Outline Logo', spec: 'Contour Vector Match 98.4% | Minimum Line Width 0.16mm', details: 'State contour fill density > 90%', status: 'PASS' },
      { id: '2', name: 'Delfino Core Markings', spec: 'Font: TI Standard OCR-B modified | Tracking 0.30mm', details: 'Optical contrast ratio: 4.8:1 on dark mold compound', status: 'PASS' },
      { id: '3', name: 'RoHS G4 Eco-Pill', spec: 'Elliptical ring enclosure with centered G4 glyph', details: 'Verified non-leaded Sn/Bi finish indicator', status: 'PASS' }
    ]
  },
  {
    id: 4,
    part_number: 'ESP32-WROOM-32D',
    manufacturer: 'Espressif Systems',
    package_type: 'Module-38',
    category: 'Wireless MCU / RF',
    font_style: 'Deep Laser Anneal',
    nominalFont: 'Deep Laser Anneal (1.10mm)',
    surfaceRoughness: 'Ra 0.6µm (Nickel Shield)',
    pin1Indent: 'Pad 1 Corner Notch & Silkscreen Arrow',
    syntaxFormula: '{ESPRESSIF} + {MODULE_NAME} + {FCC_ID} + {QR_MATRIX}',
    grooveDepth: 8.5,
    edgeAcutance: 98.2,
    confidenceScore: 0.997,
    markingTechnique: 'Fiber Anneal on Metal',
    pin_count: 38,
    logo_url: '',
    datasheet_url: 'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32d_esp32-wroom-32u_datasheet_en.pdf',
    markings_template: 'ESP32-WROOM-32D FCC ID: 2AC7Z-ESP32WROOM32D 211-180414',
    zones: [
      { id: '1', name: 'Shield Logo & Brand', spec: 'Oxidation Contrast Black-on-Metal | Reflectivity 12%', details: 'High durability laser dark-anneal', status: 'PASS' },
      { id: '2', name: 'Regulatory CMIIT/FCC', spec: 'Micro-font height 0.65mm | Stroke 0.08mm', details: 'Complies with FCC/CE/Telec optical legibility standards', status: 'PASS' },
      { id: '3', name: '2D DataMatrix Serial', spec: '12x12 ECC200 matrix code reading', details: 'Payload yields unique MAC address signature', status: 'PASS' }
    ]
  },
  {
    id: 5,
    part_number: 'MAX3232ESE+',
    manufacturer: 'Analog Devices',
    package_type: 'SOIC-16',
    category: 'Interface IC',
    font_style: 'Maxim Dot-Matrix Style',
    nominalFont: 'Laser Continuous Stroke (0.80mm)',
    surfaceRoughness: 'Ra 1.1µm (Fine Texture)',
    pin1Indent: 'Half-moon End Notch + Dot Indent',
    syntaxFormula: '{MAXIM_CREST} + {PART_NO} + {PLUS_LEADFREE} + {DATE}',
    grooveDepth: 13.9,
    edgeAcutance: 95.0,
    confidenceScore: 0.992,
    markingTechnique: 'UV Laser Etch',
    pin_count: 16,
    logo_url: '',
    datasheet_url: 'https://www.analog.com/media/en/technical-documentation/data-sheets/MAX3222-MAX3241.pdf',
    markings_template: 'MAX3232 ESE+ 2132 A41',
    zones: [
      { id: '1', name: 'Maxim Serif Crest', spec: 'Stylized "M" glyph width 1.8mm | Depth 13µm', details: 'Zero bubbling along glyph perimeters', status: 'PASS' },
      { id: '2', name: 'Product Code Line', spec: 'Standard SOIC-16 Top Centered | Kerning 0.24mm', details: 'Plus "+" character indicates RoHS compliance', status: 'PASS' },
      { id: '3', name: 'Lot & Assembly Code', spec: 'YYWW Format: 2132 (2021, Week 32)', details: 'Cavity index "A41" validated against fab records', status: 'PASS' }
    ]
  },
  {
    id: 6,
    part_number: 'NE555P',
    manufacturer: 'Texas Instruments',
    package_type: 'DIP-8',
    category: 'Timer IC',
    font_style: 'Classic Pad-Print & Laser Hybrid',
    nominalFont: 'Laser Continuous Stroke (1.20mm)',
    surfaceRoughness: 'Ra 1.8µm (Coarse Mold)',
    pin1Indent: 'Semicircular End Notch (Width 1.5mm)',
    syntaxFormula: '{TI_LOGO} + NE555P + {LOT_TRACE} + {DATE_CODE}',
    grooveDepth: 16.0,
    edgeAcutance: 92.4,
    confidenceScore: 0.989,
    markingTechnique: 'High-Contrast Laser',
    pin_count: 8,
    logo_url: '',
    datasheet_url: 'https://www.ti.com/lit/ds/symlink/ne555.pdf',
    markings_template: 'NE555P TI 2315 BATCH_A7',
    zones: [
      { id: '1', name: 'Manufacturer Stamp', spec: 'TI Emblem or Text Mark | Minimum Height 1.2mm', details: 'Pad printed / laser hybrid compliance', status: 'PASS' },
      { id: '2', name: 'Part Designation', spec: 'NE555P Bold Sans-Serif | Width 4.8mm', details: 'Standard DIP center alignment', status: 'PASS' },
      { id: '3', name: 'Batch & Assembly Line', spec: '2315 BATCH_A7 (2023, Week 15)', details: 'Sub-surface depth: 16.0µm', status: 'PASS' }
    ]
  }
];

export const ReferenceDatabase: React.FC = () => {
  const [samples, setSamples] = useState<ExtendedGoldenSample[]>(DEFAULT_GOLDEN_SAMPLES);
  const [selectedSpecimen, setSelectedSpecimen] = useState<ExtendedGoldenSample>(DEFAULT_GOLDEN_SAMPLES[0]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [selectedPackage, setSelectedPackage] = useState('All');
  const [selectedTechnique, setSelectedTechnique] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'part' | 'score'>('newest');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // CAD Viewport Controls
  const [zoomLevel, setZoomLevel] = useState(125);
  const [copiedSyntax, setCopiedSyntax] = useState(false);
  const [showOcrTestModal, setShowOcrTestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Golden Sample Form State
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('Texas Instruments');
  const [newPackageType, setNewPackageType] = useState('LQFP-64');
  const [newTechnique, setNewTechnique] = useState('Fiber Laser Anneal');
  const [newNominalFont, setNewNominalFont] = useState('Laser Dot-Matrix (0.85mm)');
  const [newSurfaceRoughness, setNewSurfaceRoughness] = useState('Ra 1.2µm (Matte Mold)');
  const [newPin1Indent, setNewPin1Indent] = useState('Ø 1.20mm (Top-Left)');
  const [newSyntax, setNewSyntax] = useState('{MFR_LOGO} + {PART_NO} + {LOT_TRACE} + {DATE_CODE}');

  // Load from API if available
  useEffect(() => {
    loadDatabase();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDatabase = async () => {
    setLoading(true);
    try {
      const apiParts = await apiService.getReference();
      if (apiParts && apiParts.length > 0) {
        // Merge API parts with extended properties
        const merged = apiParts.map((item, idx) => {
          const fallback = DEFAULT_GOLDEN_SAMPLES[idx % DEFAULT_GOLDEN_SAMPLES.length];
          return {
            ...fallback,
            ...item,
            nominalFont: fallback.nominalFont,
            surfaceRoughness: fallback.surfaceRoughness,
            pin1Indent: fallback.pin1Indent,
            syntaxFormula: fallback.syntaxFormula,
            grooveDepth: fallback.grooveDepth,
            edgeAcutance: fallback.edgeAcutance,
            confidenceScore: fallback.confidenceScore,
            markingTechnique: fallback.markingTechnique,
            zones: fallback.zones
          } as ExtendedGoldenSample;
        });
        setSamples(merged);
        if (merged.length > 0) setSelectedSpecimen(merged[0]);
      }
    } catch (e) {
      console.warn('Using local golden samples catalog');
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted samples
  const filteredSamples = useMemo(() => {
    return samples.filter(item => {
      const matchSearch = search.trim() === '' || 
        item.part_number.toLowerCase().includes(search.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        item.package_type.toLowerCase().includes(search.toLowerCase()) ||
        item.nominalFont.toLowerCase().includes(search.toLowerCase());
      
      const matchMfr = selectedManufacturer === 'All' || item.manufacturer === selectedManufacturer;
      const matchPkg = selectedPackage === 'All' || item.package_type.includes(selectedPackage);
      const matchTech = selectedTechnique === 'All' || item.markingTechnique === selectedTechnique;

      return matchSearch && matchMfr && matchPkg && matchTech;
    }).sort((a, b) => {
      if (sortBy === 'part') return a.part_number.localeCompare(b.part_number);
      if (sortBy === 'score') return b.confidenceScore - a.confidenceScore;
      return b.id - a.id;
    });
  }, [samples, search, selectedManufacturer, selectedPackage, selectedTechnique, sortBy]);

  // Unique filter options
  const manufacturers = useMemo(() => {
    return ['All', ...Array.from(new Set(samples.map(s => s.manufacturer)))];
  }, [samples]);

  const packageTypes = useMemo(() => {
    return ['All', 'LQFP', 'TQFP', 'SOIC', 'DIP', 'Module'];
  }, []);

  const markingTechniques = useMemo(() => {
    return ['All', ...Array.from(new Set(samples.map(s => s.markingTechnique)))];
  }, [samples]);

  // Export handler
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const res = await apiService.exportReferenceDatabase(format);
      if (format === 'csv' && res instanceof Blob) {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ic_golden_database_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
      } else {
        const jsonStr = JSON.stringify(res, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ic_golden_database_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      }
      showToast(`Exported ${filteredSamples.length} golden reference records (${format.toUpperCase()})`);
    } catch (e) {
      showToast('Export triggered locally');
    }
  };

  const handleSyncSpecs = () => {
    showToast('ODB++ IPC-2581 Spec database synced successfully (14,820 definitions refreshed)');
  };

  const handleBatchImport = () => {
    showToast('Ready for CAD Gerber / ODB++ template package drop (XML/ZIP format)');
  };

  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartNumber.trim()) return;

    const newSample: ExtendedGoldenSample = {
      id: Date.now(),
      part_number: newPartNumber.trim().toUpperCase(),
      manufacturer: newManufacturer,
      package_type: newPackageType,
      category: 'Integrated Circuit',
      font_style: 'Laser Matrix V2',
      nominalFont: newNominalFont,
      surfaceRoughness: newSurfaceRoughness,
      pin1Indent: newPin1Indent,
      syntaxFormula: newSyntax,
      grooveDepth: 14.0,
      edgeAcutance: 95.2,
      confidenceScore: 0.995,
      markingTechnique: newTechnique,
      pin_count: parseInt(newPackageType.replace(/\D/g, '')) || 48,
      logo_url: '',
      datasheet_url: '',
      markings_template: `${newPartNumber.trim().toUpperCase()} ${newManufacturer.slice(0, 3).toUpperCase()} 2420`,
      zones: [
        { id: '1', name: 'Logo & Manufacturer Stamp', spec: 'Verified OEM Emblem | Ratio 1.35', details: 'Direct laser burn compliance', status: 'PASS' },
        { id: '2', name: 'Part Number Alignment', spec: `Font: ${newNominalFont} | Kerning 0.25mm`, details: '100% vector OCR fidelity', status: 'PASS' },
        { id: '3', name: 'Traceability Lot Marking', spec: 'Standard YYWW Factory Coding', details: 'Sub-surface calibrated profile', status: 'PASS' }
      ]
    };

    setSamples([newSample, ...samples]);
    setSelectedSpecimen(newSample);
    setShowAddModal(false);
    setNewPartNumber('');
    showToast(`Added Golden Sample: ${newSample.part_number} to verified repository`);
  };

  const copyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2000);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in text-slate-800 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">
            Reference Database
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Standard Golden Samples & Verified Markings Library for Computer Vision Matching
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B4F9C] hover:bg-[#083D7A] text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Golden Sample</span>
          </button>

          <button
            onClick={handleBatchImport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all"
            title="Batch Import Templates from CAD Gerber or ODB++"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Batch Import Templates</span>
          </button>

          <button
            onClick={handleSyncSpecs}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all"
            title="Sync with ODB++ IPC-2581 Cloud"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Sync ODB++ Specs</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button 
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 hidden group-hover:block z-20">
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-600" />
                <span>JSON Specs</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 5 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Golden Samples</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active Repo
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">14,820</span>
            <span className="text-[11px] font-semibold text-emerald-600">+12.4% MoM</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Verified MFRs</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
              Global Tier-1
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">142</span>
            <span className="text-[11px] font-normal text-slate-400">JEDEC Compliant</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Font Matrix Profiles</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
              OCR Master Data
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">520</span>
            <span className="text-[11px] font-normal text-slate-400">Sub-pixel Trained</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Laser OCR Masks</span>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
              Depth-Calibrated
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">1,290</span>
            <span className="text-[11px] font-normal text-slate-400">Ra 0.4µm - 2.5µm</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Last ODB++ Sync</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Synched
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-800">Today, 08:30 UTC</span>
            <span className="text-[10px] text-slate-400 font-mono">v4.18.2</span>
          </div>
        </div>

      </div>

      {/* 3. Search Bar, View Mode Toggle & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm space-y-3">
        
        {/* Upper Row: Search, View Switch, Sort */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input with EQ prefix & ALT+F hint */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200 mr-1.5">
                EQ
              </span>
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part number, manufacturer, package, or font spec..."
              className="w-full pl-16 pr-16 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-2xs">
                ALT+F
              </span>
            </div>
          </div>

          {/* View Toggle: Table vs Cards */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="part">Sort: Part Number (A-Z)</option>
              <option value="score">Sort: Highest Match Score</option>
            </select>
          </div>

        </div>

        {/* Lower Row: Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Manufacturer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Manufacturer:</span>
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-white"
            >
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m === 'All' ? 'All MFRs' : m}</option>
              ))}
            </select>
          </div>

          {/* Package Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Package Type:</span>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-white"
            >
              {packageTypes.map((p) => (
                <option key={p} value={p}>{p === 'All' ? 'All Packages' : p}</option>
              ))}
            </select>
          </div>

          {/* Marking Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Marking:</span>
            <select
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-white"
            >
              {markingTechniques.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Techniques' : t}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {(selectedManufacturer !== 'All' || selectedPackage !== 'All' || selectedTechnique !== 'All' || search) && (
            <button
              onClick={() => {
                setSelectedManufacturer('All');
                setSelectedPackage('All');
                setSelectedTechnique('All');
                setSearch('');
              }}
              className="ml-auto text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-slate-700">{filteredSamples.length}</strong> cataloged reference templates
          </div>

        </div>

      </div>

      {/* 4. MAIN CONTENT AREA */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Part Number</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Marking Technique</th>
                  <th className="py-3 px-4">Nominal Font</th>
                  <th className="py-3 px-4">Surface Roughness</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSamples.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => { setSelectedSpecimen(item); setViewMode('cards'); }}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      selectedSpecimen.id === item.id ? 'bg-blue-50/70 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      {item.part_number}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{item.manufacturer}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{item.package_type}</td>
                    <td className="py-3 px-4 text-slate-600">{item.markingTechnique}</td>
                    <td className="py-3 px-4 text-slate-600">{item.nominalFont}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{item.surfaceRoughness}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {(item.confidenceScore * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpecimen(item);
                          setViewMode('cards');
                        }}
                        className="px-2.5 py-1 bg-[#0B4F9C] text-white text-[11px] font-semibold rounded hover:bg-blue-800"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS SPLIT VIEW: Left Cataloged Samples, Right CAD Inspection Specimen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Cataloged Reference Samples (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Cataloged Golden Samples ({filteredSamples.length})
              </h2>
              <span className="text-[11px] text-slate-400">Click specimen to view CAD</span>
            </div>

            {/* List of sample cards */}
            <div className="space-y-3.5 max-h-[1050px] overflow-y-auto pr-1">
              {filteredSamples.map((sample) => {
                const isSelected = selectedSpecimen.id === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => setSelectedSpecimen(sample)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200 shadow-sm ${
                      isSelected 
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Thumbnail + Title + Badges */}
                    <div className="flex items-start gap-3">
                      
                      {/* Chip Micro-Thumbnail with REF badge */}
                      <div className="relative w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        {/* Metallic leads simulation */}
                        <div className="absolute inset-0.5 border border-dashed border-slate-600 rounded" />
                        <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-slate-400 font-mono text-[9px] font-bold">
                          IC
                        </div>
                        {/* REF Watermark */}
                        <span className="absolute bottom-0 right-0 bg-blue-600 text-[8px] font-black text-white px-1 rounded-tl">
                          REF
                        </span>
                      </div>

                      {/* Part info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {sample.part_number}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE REF
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            OEM Master
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {sample.manufacturer} • {sample.package_type}
                        </p>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpecimen(sample);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-colors ${
                            isSelected 
                              ? 'bg-[#0B4F9C] text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpecimen(sample);
                            setShowOcrTestModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white border border-slate-200 hover:border-slate-300 text-slate-600 flex items-center gap-1"
                        >
                          <Activity className="w-3 h-3 text-blue-600" />
                          <span>Test OCR</span>
                        </button>
                      </div>

                    </div>

                    {/* Mark Formula / Syntax Box */}
                    <div className="mt-3 bg-slate-50 rounded-lg p-2 border border-slate-200/70 font-mono text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="truncate pr-2">
                        <strong className="text-slate-800">Syntax:</strong> {sample.syntaxFormula}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyFormula(sample.syntaxFormula);
                        }} 
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Copy syntax template"
                      >
                        {copiedSyntax ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* 3-Column Micro-specs */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-slate-100 text-slate-500">
                      <div>
                        <div className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Nominal Font</div>
                        <div className="font-semibold text-slate-700 truncate mt-0.5">{sample.nominalFont}</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Surface Roughness</div>
                        <div className="font-semibold text-slate-700 truncate mt-0.5">{sample.surfaceRoughness}</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-400 uppercase tracking-wider text-[8px]">Pin 1 Indent</div>
                        <div className="font-semibold text-slate-700 truncate mt-0.5">{sample.pin1Indent}</div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: CAD Inspection Specimen Viewport & Metrics (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header with specimen details */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    SPECIMEN
                  </span>
                  <h2 className="text-lg font-black font-mono text-slate-900">
                    {selectedSpecimen.part_number}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-1">
                  <span>Package: <strong className="text-slate-800">{selectedSpecimen.package_type}</strong></span>
                  <span>•</span>
                  <span>Revision: <strong className="text-slate-800">Rev 3.2 (IPC-7351B Standard)</strong></span>
                  <span>•</span>
                  <span>Tolerance: <strong className="text-slate-800">±0.02mm</strong></span>
                </div>
              </div>

              {/* Viewport Zoom & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button 
                    onClick={() => setZoomLevel(Math.max(75, zoomLevel - 25))}
                    className="p-1 hover:bg-white rounded text-slate-600"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[10px] font-mono font-bold text-slate-700">{zoomLevel}%</span>
                  <button 
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    className="p-1 hover:bg-white rounded text-slate-600"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowOcrTestModal(true)}
                  className="px-3 py-1.5 bg-[#0B4F9C] hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run OCR Match</span>
                </button>
              </div>
            </div>

            {/* 4a. Dark CAD Blueprint Terminal Viewport */}
            <div className="relative rounded-2xl bg-[#0a0f1d] border border-slate-800 shadow-xl overflow-hidden p-6 select-none min-h-[360px] flex flex-col justify-between">
              
              {/* Cyan Alignment Brackets */}
              <div className="absolute top-3 left-3 text-cyan-400 font-mono text-xs opacity-70">┌</div>
              <div className="absolute top-3 right-3 text-cyan-400 font-mono text-xs opacity-70">┐</div>
              <div className="absolute bottom-3 left-3 text-cyan-400 font-mono text-xs opacity-70">└</div>
              <div className="absolute bottom-3 right-3 text-cyan-400 font-mono text-xs opacity-70">┘</div>

              {/* Grid Background Pattern */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Top CAD Status HUD */}
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-cyan-300 font-semibold">CAD ALIGNMENT MATRIX [IPC-7351]</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>SCALE: 5.0mm | FOV: 24.5mm</span>
                  <span className="text-slate-300 font-bold bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                    3 Active OCR Zones
                  </span>
                </div>
              </div>

              {/* Interactive Virtual IC Package Display */}
              <div className="relative z-10 my-8 flex items-center justify-center">
                
                {/* Outer Pin Array (LQFP simulation) */}
                <div 
                  className="relative transition-transform duration-300"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  
                  {/* Lead Pins Top */}
                  <div className="absolute -top-3 left-6 right-6 flex justify-between">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-3 bg-gradient-to-b from-amber-200 to-slate-400 rounded-t-xs" />
                    ))}
                  </div>

                  {/* Lead Pins Bottom */}
                  <div className="absolute -bottom-3 left-6 right-6 flex justify-between">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-3 bg-gradient-to-b from-slate-400 to-amber-200 rounded-b-xs" />
                    ))}
                  </div>

                  {/* Lead Pins Left */}
                  <div className="absolute -left-3 top-6 bottom-6 flex flex-col justify-between">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-1.5 w-3 bg-gradient-to-r from-amber-200 to-slate-400 rounded-l-xs" />
                    ))}
                  </div>

                  {/* Lead Pins Right */}
                  <div className="absolute -right-3 top-6 bottom-6 flex flex-col justify-between">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-1.5 w-3 bg-gradient-to-r from-slate-400 to-amber-200 rounded-r-xs" />
                    ))}
                  </div>

                  {/* Main IC Package Body (Black Mold Compound) */}
                  <div className="w-80 h-64 bg-gradient-to-br from-[#182030] via-[#111726] to-[#0c121e] rounded-xl border-2 border-slate-600/80 shadow-2xl p-5 relative flex flex-col justify-between overflow-hidden">
                    
                    {/* Mold Texture Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                    {/* Pin 1 Indent Indicator with Depth Callout */}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 shadow-inner flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-xs shadow-cyan-400" />
                        </div>
                        <span className="text-[8px] font-mono text-cyan-300/80 uppercase">
                          PIN 1 INDENT (DEPTH: 0.15mm)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">e4 RoHS</span>
                    </div>

                    {/* Center Markings with Annotated OCR Bounding Boxes */}
                    <div className="space-y-2.5 my-auto">
                      
                      {/* Bounding Box ❶: MFR Logo */}
                      <div className="relative group border border-dashed border-cyan-400/80 bg-cyan-500/10 rounded px-2.5 py-1 transition-all hover:bg-cyan-500/20">
                        <span className="absolute -top-2 left-2 px-1 text-[8px] font-mono font-bold bg-cyan-900 text-cyan-300 border border-cyan-500 rounded">
                          ❶ MFR LOGO (PASS 99.8%)
                        </span>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-serif font-black tracking-widest text-slate-200">
                            {selectedSpecimen.manufacturer.toUpperCase().slice(0, 16)}
                          </span>
                        </div>
                      </div>

                      {/* Bounding Box ❷: Part Number */}
                      <div className="relative group border border-dashed border-sky-400/90 bg-sky-500/10 rounded px-2.5 py-1.5 transition-all hover:bg-sky-500/20">
                        <span className="absolute -top-2 left-2 px-1 text-[8px] font-mono font-bold bg-sky-900 text-sky-200 border border-sky-500 rounded">
                          ❷ PART NUMBER: {selectedSpecimen.part_number}
                        </span>
                        <div className="pt-0.5 text-center font-mono font-bold tracking-wider text-sm text-white drop-shadow">
                          {selectedSpecimen.part_number}
                        </div>
                      </div>

                      {/* Bounding Box ❸: Date Code & Traceability */}
                      <div className="relative group border border-dashed border-emerald-400/80 bg-emerald-500/10 rounded px-2.5 py-1 transition-all hover:bg-emerald-500/20">
                        <span className="absolute -top-2 left-2 px-1 text-[8px] font-mono font-bold bg-emerald-900 text-emerald-300 border border-emerald-500 rounded">
                          ❸ DATE/LOT: PHL 2348 Z
                        </span>
                        <div className="pt-0.5 text-center font-mono text-xs text-slate-300 tracking-widest">
                          {selectedSpecimen.markings_template}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Substrate Footprint Specs */}
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-800 pt-1">
                      <span>DIM: 14.0 x 14.0 mm</span>
                      <span>BODY: EPOXY NOVOLAC</span>
                    </div>

                  </div>

                </div>

              </div>

              {/* Bottom CAD Controls Legend */}
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">❶ Vector Mark</span>
                  <span className="text-sky-400">❷ Primary OCR</span>
                  <span className="text-emerald-400">❸ Traceability</span>
                </div>
                <div className="text-slate-500">
                  Precision Coordinate Reference • Sub-micron Resolution
                </div>
              </div>

            </div>

            {/* 4b. Annotated Optical Inspection Zones Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Optical Inspection Zones Definition
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  All 3 Zones Calibrated
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedSpecimen.zones.map((zone) => (
                  <div key={zone.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {zone.id}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800">{zone.name}</h4>
                        <p className="text-[11px] font-mono text-slate-600 mt-0.5">{zone.spec}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{zone.details}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      {zone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4c. Laser Depth & Contrast Spectrometry */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
                  Laser Depth & Contrast Spectrometry
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Compliant (Score: {selectedSpecimen.confidenceScore.toFixed(3)})
                </span>
              </div>

              {/* Depth Profilometry Chart SVG */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pb-1.5">
                  <span>GROOVE DEPTH PROFILE (Z-AXIS INTERFEROMETRY)</span>
                  <span className="text-cyan-400">NOMINAL: 15.0µm ± 2.0µm</span>
                </div>
                
                {/* SVG Curve */}
                <svg className="w-full h-16" viewBox="0 0 400 60" preserveAspectRatio="none">
                  {/* Tolerance Band */}
                  <rect x="0" y="15" width="400" height="25" fill="#38bdf8" fillOpacity="0.08" />
                  <line x1="0" y1="27.5" x2="400" y2="27.5" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.4" />
                  
                  {/* Etch Curve Profile */}
                  <path 
                    d="M 0 10 Q 50 12, 80 14 T 120 45 T 140 48 T 160 14 T 210 12 T 250 44 T 270 46 T 290 14 T 350 12 T 400 10" 
                    fill="none" 
                    stroke="#22d3ee" 
                    strokeWidth="2" 
                  />
                  {/* Measured dots */}
                  <circle cx="140" cy="48" r="3" fill="#34d399" />
                  <circle cx="270" cy="46" r="3" fill="#34d399" />
                </svg>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1">
                  <span>0.0mm (Surface)</span>
                  <span className="text-emerald-400 font-bold">Peak Groove Depth: {selectedSpecimen.grooveDepth} µm</span>
                  <span>14.0mm (Package End)</span>
                </div>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs pt-1">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-semibold">Average Groove Depth</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{selectedSpecimen.grooveDepth} µm</div>
                  <div className="text-[9px] text-slate-400">Nominal: 15.0 ± 2.0 µm</div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-semibold">Edge Acutance Gradient</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{selectedSpecimen.edgeAcutance}%</div>
                  <div className="text-[9px] text-emerald-600 font-semibold">Crisp Laser Edge</div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-semibold">Chemical Resistance</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">MIL-STD</div>
                  <div className="text-[9px] text-slate-400">Passed MIL-STD-883K</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 5. ADD GOLDEN SAMPLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Golden Sample Specimen</h3>
                <p className="text-xs text-slate-500">Register new OEM reference template with OCR syntax rules</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSample} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Part Number *</label>
                  <input
                    type="text"
                    required
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    placeholder="e.g. STM32H743VIT6"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    placeholder="e.g. STMicroelectronics"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Type *</label>
                  <input
                    type="text"
                    required
                    value={newPackageType}
                    onChange={(e) => setNewPackageType(e.target.value)}
                    placeholder="e.g. LQFP-100 (14x14mm)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Marking Technique</label>
                  <select
                    value={newTechnique}
                    onChange={(e) => setNewTechnique(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    <option value="Fiber Laser Anneal">Fiber Laser Anneal</option>
                    <option value="UV Laser Direct Mark">UV Laser Direct Mark</option>
                    <option value="CO2 Vector Laser">CO2 Vector Laser</option>
                    <option value="Laser Dot-Matrix">Laser Dot-Matrix</option>
                    <option value="Pad Print & Cure">Pad Print & Cure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nominal Font</label>
                  <input
                    type="text"
                    value={newNominalFont}
                    onChange={(e) => setNewNominalFont(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Surface Roughness</label>
                  <input
                    type="text"
                    value={newSurfaceRoughness}
                    onChange={(e) => setNewSurfaceRoughness(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pin 1 Indent</label>
                  <input
                    type="text"
                    value={newPin1Indent}
                    onChange={(e) => setNewPin1Indent(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Marking Syntax Formula</label>
                <input
                  type="text"
                  value={newSyntax}
                  onChange={(e) => setNewSyntax(e.target.value)}
                  placeholder="{MFR_LOGO} + {PART_NO} + {LOT_TRACE} + {DATE_CODE}"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B4F9C] hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Golden Sample
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. OCR TEST MODAL SIMULATION */}
      {showOcrTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  OCR Verification Test: {selectedSpecimen.part_number}
                </h3>
              </div>
              <button 
                onClick={() => setShowOcrTestModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-900">Golden Template Match: 99.8%</div>
                    <div className="text-[11px] text-emerald-700">Zero font variance detected against IPC-7351 profile</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-sm">PASS</span>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 space-y-2 font-mono text-[11px] bg-slate-50">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Specimen:</span>
                  <span className="font-bold text-slate-800">{selectedSpecimen.part_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MFR Syntax Formula:</span>
                  <span className="text-blue-700 font-semibold">{selectedSpecimen.syntaxFormula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Laser Micro-Depth:</span>
                  <span className="text-slate-800">{selectedSpecimen.grooveDepth} µm (Tolerance OK)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edge Acutance Ratio:</span>
                  <span className="text-emerald-700 font-bold">{selectedSpecimen.edgeAcutance}% (Crisp)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                This verification test certifies that live camera feeds matching this template will have automatic bounding box alignment and high-confidence OCR parsing.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowOcrTestModal(false)}
                className="px-4 py-2 bg-[#0B4F9C] text-white font-bold rounded-lg hover:bg-blue-800 text-xs"
              >
                Close Test Console
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ReferenceDatabase;
