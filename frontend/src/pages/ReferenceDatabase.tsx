import React, { useState, useEffect } from 'react';
import { Search, Plus, Database, Cpu, ExternalLink, Link, Info, X, Check } from 'lucide-react';
import { apiService, ReferenceIC } from '../services/api';

export default function ReferenceDatabase() {
  const [references, setReferences] = useState<ReferenceIC[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State for adding new reference
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('Texas Instruments');
  const [newPackageType, setNewPackageType] = useState('DIP-8');
  const [newFontStyle, setNewFontStyle] = useState('Standard TI Sans-Serif');
  const [newDatasheetUrl, setNewDatasheetUrl] = useState('');
  const [newPinCount, setNewPinCount] = useState(8);
  const [newLogoUrl, setNewLogoUrl] = useState('');
  
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const fetchReferences = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReference(search);
      setReferences(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, [search]);

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!newPartNumber) {
      setModalError("Part Number is required.");
      return;
    }

    try {
      await apiService.addReference({
        part_number: newPartNumber.trim().toUpperCase(),
        manufacturer: newManufacturer,
        package_type: newPackageType,
        font_style: newFontStyle,
        logo_url: newLogoUrl || "https://upload.wikimedia.org/wikipedia/commons/e/ec/STMicroelectronics_logo.svg",
        datasheet_url: newDatasheetUrl || "https://www.ti.com/lit/ds/symlink/ne555.pdf",
        pin_count: newPinCount,
        markings_template: `${newPartNumber.trim().toUpperCase()}|${newManufacturer.split(' ')[0].toUpperCase()}|YYWW`
      });

      setModalSuccess("New reference IC registered successfully!");
      // Reset form
      setNewPartNumber('');
      setNewDatasheetUrl('');
      
      // Refresh list
      fetchReferences();
      
      // Delay modal close
      setTimeout(() => {
        setShowAddModal(false);
        setModalSuccess(null);
      }, 1500);

    } catch (err: any) {
      setModalError(err.message || "Failed to add reference part.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cardBorder pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Genuine IC Reference Database</h2>
          <p className="text-xs text-gray-400">Search and verify manufacturers, package styles, markings, and official datasheet links.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-electricCyan to-blue-500 text-background font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Register New IC rules
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search catalog by part number or manufacturer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900/60 border border-cardBorder text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-electricCyan transition-all"
        />
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-electricCyan border-t-transparent rounded-full animate-spin" />
          <span>Searching reference rules...</span>
        </div>
      ) : references.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-500">
          No registered reference records match this search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {references.map((item) => (
            <div key={item.id} className="rounded-xl glass-panel p-5 border border-cardBorder/60 flex flex-col justify-between hover:border-electricCyan/35 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                {/* Package icon & Manufacturer */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 border border-cardBorder flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-electricCyan" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 truncate max-w-[130px]">{item.manufacturer}</h4>
                      <h3 className="text-sm font-extrabold text-white mt-0.5">{item.part_number}</h3>
                    </div>
                  </div>
                  
                  {/* Pin count badge */}
                  <span className="px-2 py-0.5 rounded bg-gray-800 border border-cardBorder text-[10px] font-bold text-gray-400">
                    {item.pin_count} Pins
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs bg-gray-950/40 border border-cardBorder/40 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package Type:</span>
                    <span className="text-gray-300 font-semibold">{item.package_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Font Guideline:</span>
                    <span className="text-gray-300 font-semibold truncate max-w-[150px]">{item.font_style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Marking Pattern:</span>
                    <span className="text-electricCyan font-mono text-[10px]">{item.markings_template || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Datasheet Link */}
              <div className="mt-4 pt-3 border-t border-cardBorder/60 flex justify-end">
                {item.datasheet_url && (
                  <a 
                    href={item.datasheet_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-gray-400 hover:text-electricCyan font-bold flex items-center gap-1 transition-colors"
                  >
                    View Official Datasheet <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-md rounded-2xl glass-panel-glow-cyan border border-cardBorder p-6 shadow-2xl space-y-6">
            
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-900 border border-cardBorder text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-red-950/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Device catalog rules</span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">Register New Reference IC</h3>
            </div>

            {modalError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddReference} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Part Number (e.g. NE555P)</label>
                <input
                  type="text"
                  required
                  placeholder="STM32F103C8T6"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-900 border border-cardBorder text-gray-200 placeholder-gray-600 focus:outline-none focus:border-electricCyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Manufacturer</label>
                  <select
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-900 border border-cardBorder text-gray-200 focus:outline-none focus:border-electricCyan"
                  >
                    <option value="Texas Instruments">Texas Instruments</option>
                    <option value="STMicroelectronics">STMicroelectronics</option>
                    <option value="Microchip Technology">Microchip Technology</option>
                    <option value="Espressif Systems">Espressif Systems</option>
                    <option value="ON Semiconductor">ON Semiconductor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Package Outline</label>
                  <select
                    value={newPackageType}
                    onChange={(e) => setNewPackageType(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-900 border border-cardBorder text-gray-200 focus:outline-none focus:border-electricCyan"
                  >
                    <option value="DIP-8">DIP-8</option>
                    <option value="DIP-28">DIP-28</option>
                    <option value="LQFP-48">LQFP-48</option>
                    <option value="SMD-38">SMD-38</option>
                    <option value="TO-220">TO-220</option>
                    <option value="SOIC-8">SOIC-8</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Pins Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newPinCount}
                    onChange={(e) => setNewPinCount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-gray-900 border border-cardBorder text-gray-200 focus:outline-none focus:border-electricCyan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Standard Marking Font</label>
                  <input
                    type="text"
                    value={newFontStyle}
                    onChange={(e) => setNewFontStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-900 border border-cardBorder text-gray-200 focus:outline-none focus:border-electricCyan"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Datasheet Reference Link</label>
                <input
                  type="url"
                  placeholder="https://example.com/datasheet.pdf"
                  value={newDatasheetUrl}
                  onChange={(e) => setNewDatasheetUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-900 border border-cardBorder text-gray-200 placeholder-gray-600 focus:outline-none focus:border-electricCyan"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-gray-900 border border-cardBorder text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-electricCyan text-background font-bold hover:opacity-90"
                >
                  Save Rules
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
