import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Sprout,
  ShoppingBag,
  HelpCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Leaf,
  Pencil,
  X,
  Loader2,
  Image,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  ImagePlus,
  Tag,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type PlantRow = Database['public']['Tables']['plants']['Row'];
type PlacementFilter = 'all' | 'indoor' | 'outdoor';
type ModalMode = 'create' | 'edit';

type PlantFormState = Omit<PlantRow, 'plant_id'> & {
  plant_id?: PlantRow['plant_id'];
};

type PlantsTabHandle = {
  openCreateModal: () => void;
};

type SuppliesTabHandle = {
  startCreate: () => void;
};

type FaqsTabHandle = {
  startCreate: () => void;
};

const EMPTY_PLANT_FORM: PlantFormState = {
  plant_id: undefined,
  plant_name: '',
  short_description: '',
  long_description: '',
  indoor_outdoor: 'Indoor',
  best_placement: '',
  growing_season: '',
  first_harvest: '',
  final_harvest: '',
  harvest_method: '',
  plant_image: '',
  average_rating: null,
};

type FaqRow = Database['public']['Tables']['tower_faq']['Row'];

type FaqFormState = {
  question: string;
  answer: string;
  category: string;
  links: string;
};

type FaqStatusMessage = {
  type: 'success' | 'error';
  message: string;
};

const EMPTY_FAQ_FORM: FaqFormState = {
  question: '',
  answer: '',
  category: '',
  links: '',
};

const SUPPLIES_TABLE = (import.meta.env.VITE_SUPPLIES_TABLE as string | undefined)?.trim() || 'tower_supplies';
const SUPPLIES_BUCKET = (import.meta.env.VITE_SUPPLIES_BUCKET as string | undefined)?.trim() || 'supply-images';
const supplyClient: SupabaseClient = supabase;

const SUPPLY_STATUSES = ['draft', 'review', 'published', 'archived'] as const;
type SupplyStatus = (typeof SUPPLY_STATUSES)[number];

const supplyStatusLabels = {
  draft: 'Draft',
  review: 'In review',
  published: 'Published',
  archived: 'Archived',
} as const satisfies Record<SupplyStatus, string>;

const supplyStatusStyles = {
  draft: 'bg-amber-50 text-amber-700 border border-amber-200/70',
  review: 'bg-sky-50 text-sky-700 border border-sky-200/70',
  published: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
  archived: 'bg-gray-100 text-gray-500 border border-gray-200/70',
} as const satisfies Record<SupplyStatus, string>;

type SupplyRecord = {
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  summary: string | null;
  description: string | null;
  status: SupplyStatus | string | null;
  price_range: string | null;
  resource_url: string | null;
  purchase_url: string | null;
  image_url: string | null;
  tags: string[] | string | null;
  created_at: string | null;
  updated_at: string | null;
};

type SupplyFormState = {
  id?: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  status: SupplyStatus;
  price_range: string;
  resource_url: string;
  purchase_url: string;
  image_url: string;
  tags: string;
  brand: string;
};

const EMPTY_SUPPLY_FORM: SupplyFormState = {
  id: undefined,
  name: '',
  category: '',
  summary: '',
  description: '',
  status: 'draft',
  price_range: '',
  resource_url: '',
  purchase_url: '',
  image_url: '',
  tags: '',
  brand: '',
};

type ParsedSupabaseError = {
  code?: string;
  message?: string;
  details?: string;
};

function normalizeSupplyStatus(value?: string | null): SupplyStatus {
  const normalized = (value ?? 'draft').toLowerCase();
  if (SUPPLY_STATUSES.includes(normalized as SupplyStatus)) {
    return normalized as SupplyStatus;
  }
  return 'draft';
}

export function Content() {
  const [activeTab, setActiveTab] = useState<'plants' | 'supplies' | 'faqs'>('supplies');
  const plantsTabRef = useRef<PlantsTabHandle | null>(null);
  const suppliesTabRef = useRef<SuppliesTabHandle | null>(null);
  const faqsTabRef = useRef<FaqsTabHandle | null>(null);

  const handleAddClick = () => {
    if (activeTab === 'plants') {
      plantsTabRef.current?.openCreateModal();
      return;
    }

    if (activeTab === 'supplies') {
      suppliesTabRef.current?.startCreate();
      return;
    }

    if (activeTab === 'faqs') {
      faqsTabRef.current?.startCreate();
      return;
    }

    window.alert('This action will be available soon for this tab.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage your app's educational content and resources.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-xl bg-imperial-blue px-4 py-2 text-white shadow-lg transition-colors hover:bg-imperial-blue/90"
        >
          <Plus className="w-5 h-5" />
          <span>
            {activeTab === 'plants' && 'Add Plant'}
            {activeTab === 'supplies' && 'Add Supply'}
            {activeTab === 'faqs' && 'Add FAQ'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-deep-navy/20 pb-1">
        <button
          onClick={() => setActiveTab('plants')}
          className={clsx(
            'flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-medium',
            activeTab === 'plants'
              ? 'bg-white border-t border-x border-deep-navy/20 text-imperial-blue'
              : 'text-gray-500 hover:bg-white/50'
          )}
        >
          <Sprout className="w-4 h-4" />
          Plants & Categories
        </button>
        <button
          onClick={() => setActiveTab('supplies')}
          className={clsx(
            'flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-medium',
            activeTab === 'supplies'
              ? 'bg-white border-t border-x border-deep-navy/20 text-imperial-blue'
              : 'text-gray-500 hover:bg-white/50'
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          Supplies
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={clsx(
            'flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-medium',
            activeTab === 'faqs'
              ? 'bg-white border-t border-x border-deep-navy/20 text-imperial-blue'
              : 'text-gray-500 hover:bg-white/50'
          )}
        >
          <HelpCircle className="w-4 h-4" />
          FAQs
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-deep-navy/20 p-6 min-h-[400px]">
        {activeTab === 'plants' && <PlantsTab ref={plantsTabRef} />}
        {activeTab === 'supplies' && <SuppliesTab ref={suppliesTabRef} />}
        {activeTab === 'faqs' && <FaqsTab ref={faqsTabRef} />}
      </div>
    </div>
  );
}

const PlantsTab = forwardRef<PlantsTabHandle>(function PlantsTab(_, ref) {
  const [plants, setPlants] = useState<PlantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [placementFilter, setPlacementFilter] = useState<PlacementFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('edit');
  const [formState, setFormState] = useState<PlantFormState>(EMPTY_PLANT_FORM);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setFormState(EMPTY_PLANT_FORM);
    setSaving(false);
  }, []);

  const openCreateModal = useCallback(() => {
    setFormState(EMPTY_PLANT_FORM);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((plant: PlantRow) => {
    setFormState({ ...plant });
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const updateForm = <K extends keyof PlantFormState>(key: K, value: PlantFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const normalizeString = (value: string | null | undefined) => {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  };

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.from('plants').select('*').order('plant_name', { ascending: true });

      if (fetchError) throw fetchError;
      setPlants(data ?? []);
    } catch (err) {
      console.error('Failed to load plants', err);
      setError(err instanceof Error ? err.message : 'Unable to load plants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  useImperativeHandle(
    ref,
    () => ({
      openCreateModal,
    }),
    [openCreateModal]
  );

  const filteredPlants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return plants.filter((plant) => {
      const matchesSearch =
        !term ||
        plant.plant_name.toLowerCase().includes(term) ||
        plant.short_description?.toLowerCase().includes(term) ||
        plant.long_description?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (placementFilter === 'all') return true;

      const placement = plant.indoor_outdoor?.toLowerCase() ?? '';
      if (placementFilter === 'indoor') {
        return placement.includes('indoor');
      }
      return placement.includes('outdoor');
    });
  }, [plants, placementFilter, searchTerm]);

  const stats = useMemo(() => {
    const indoor = plants.filter((p) => (p.indoor_outdoor ?? '').toLowerCase().includes('indoor')).length;
    const outdoor = plants.filter((p) => (p.indoor_outdoor ?? '').toLowerCase().includes('outdoor')).length;
    return {
      total: plants.length,
      indoor,
      outdoor,
    };
  }, [plants]);

  const handleSave = async () => {
    const requiredName = formState.plant_name.trim();
    if (!requiredName) {
      setBanner({ type: 'error', message: 'Plant name is required.' });
      return;
    }

    try {
      setSaving(true);
      setBanner(null);

      const payload = {
        plant_name: requiredName,
        short_description: normalizeString(formState.short_description),
        long_description: normalizeString(formState.long_description),
        indoor_outdoor: normalizeString(formState.indoor_outdoor) ?? 'Indoor',
        best_placement: normalizeString(formState.best_placement),
        growing_season: normalizeString(formState.growing_season),
        first_harvest: normalizeString(formState.first_harvest),
        final_harvest: normalizeString(formState.final_harvest),
        harvest_method: normalizeString(formState.harvest_method),
        plant_image: normalizeString(formState.plant_image),
        average_rating: formState.average_rating ?? null,
      };

      if (modalMode === 'edit' && formState.plant_id) {
        const { error: updateError } = await supabase
          .from('plants')
          .update(payload)
          .eq('plant_id', formState.plant_id)
          .select()
          .single();

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('plants').insert(payload).select().single();
        if (insertError) throw insertError;
      }

      await fetchPlants();
      setBanner({ type: 'success', message: 'Plant saved successfully.' });
      closeModal();
    } catch (err) {
      console.error('Failed to save plant', err);
      setBanner({ type: 'error', message: err instanceof Error ? err.message : 'Unable to save plant.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total plants" value={stats.total} accent="text-imperial-blue" icon={<Leaf className="w-5 h-5" />} />
        <StatCard label="Indoor ready" value={stats.indoor} accent="text-green-600" icon={<Sprout className="w-5 h-5" />} />
        <StatCard label="Outdoor friendly" value={stats.outdoor} accent="text-emerald-600" icon={<Filter className="w-5 h-5" />} />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plants by name, description, or care tips…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-deep-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-imperial-blue/40 transition-shadow"
          />
        </div>

        <div className="flex items-center gap-2 bg-icy-blue/60 border border-deep-navy/10 rounded-2xl px-3 py-2">
          <Filter className="w-4 h-4 text-imperial-blue" />
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value as PlacementFilter)}
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">All placements</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>

        <button
          onClick={fetchPlants}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-deep-navy/20 text-gray-700 hover:bg-icy-blue/70 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {banner && (
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 flex items-center gap-2',
            banner.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          )}
        >
          {banner.type === 'success' ? <Sprout className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{banner.message}</span>
          <button onClick={() => setBanner(null)} className="ml-auto text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-deep-navy/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-icy-blue/60 text-gray-600 uppercase text-xs font-semibold tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left">Plant</th>
                <th className="px-6 py-4 text-left">Placement</th>
                <th className="px-6 py-4 text-left">Harvest window</th>
                <th className="px-6 py-4 text-left">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-navy/10">
              {loading &&
                [...Array(5)].map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                        <div>
                          <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
                          <div className="h-3 w-52 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-12 bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4" />
                  </tr>
                ))}

              {!loading && filteredPlants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {error ? (
                      <div className="space-y-2">
                        <p>We couldn't load the plants. Please try refreshing.</p>
                        <button onClick={fetchPlants} className="px-4 py-2 bg-imperial-blue/10 text-imperial-blue rounded-xl font-medium">
                          Try again
                        </button>
                      </div>
                    ) : (
                      <div>We can't find any plants that match your filters.</div>
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                filteredPlants.map((plant) => (
                  <tr key={plant.plant_id} className="hover:bg-icy-blue/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {plant.plant_image ? (
                          <img src={plant.plant_image} alt={plant.plant_name} className="w-14 h-14 rounded-2xl object-cover border border-deep-navy/10" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-bright-marine/20 text-imperial-blue flex items-center justify-center font-semibold uppercase">
                            {plant.plant_name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{plant.plant_name}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{plant.short_description ?? 'No short description yet.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {plant.indoor_outdoor ?? 'Unspecified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {plant.first_harvest || plant.final_harvest ? (
                        <span>
                          {plant.first_harvest ?? '??'} → {plant.final_harvest ?? '??'}
                        </span>
                      ) : (
                        <span className="text-gray-400">TBD</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {plant.average_rating ? (
                        <span className="font-semibold text-imperial-blue">{plant.average_rating.toFixed(1)} / 5</span>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(plant)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-imperial-blue bg-imperial-blue/10 hover:bg-imperial-blue/20 rounded-xl transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-deep-navy/10 overflow-hidden"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-deep-navy/10">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">{modalMode === 'create' ? 'New Plant' : 'Manage Plant'}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{formState.plant_name || 'New plant entry'}</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  aria-label="Close plant dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-deep-navy/10">
                <div className="p-6 space-y-4 bg-icy-blue/30">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formState.plant_name}
                      onChange={(e) => updateForm('plant_name', e.target.value)}
                      className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40"
                      placeholder="e.g., Sweet Basil"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formState.plant_image ?? ''}
                      onChange={(e) => updateForm('plant_image', e.target.value)}
                      className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40"
                      placeholder="https://"
                    />
                    {formState.plant_image && (
                      <img
                        src={formState.plant_image}
                        alt="Plant preview"
                        className="rounded-2xl border border-deep-navy/10 h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700">Short description</label>
                    <textarea
                      value={formState.short_description ?? ''}
                      onChange={(e) => updateForm('short_description', e.target.value)}
                      className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40 min-h-[80px]"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700">Long description</label>
                    <textarea
                      value={formState.long_description ?? ''}
                      onChange={(e) => updateForm('long_description', e.target.value)}
                      className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40 min-h-[120px]"
                    />
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Placement</label>
                      <select
                        value={formState.indoor_outdoor ?? 'Indoor'}
                        onChange={(e) => updateForm('indoor_outdoor', e.target.value)}
                        className="rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40"
                      >
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                        <option value="Indoor & Outdoor">Indoor & Outdoor</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Avg. rating</label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={formState.average_rating ?? ''}
                        onChange={(e) => updateForm('average_rating', e.target.value === '' ? null : Number(e.target.value))}
                        className="rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40"
                        placeholder="4.8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Best placement" value={formState.best_placement ?? ''} onChange={(val) => updateForm('best_placement', val)} />
                    <FormField label="Growing season" value={formState.growing_season ?? ''} onChange={(val) => updateForm('growing_season', val)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="First harvest" value={formState.first_harvest ?? ''} onChange={(val) => updateForm('first_harvest', val)} />
                    <FormField label="Final harvest" value={formState.final_harvest ?? ''} onChange={(val) => updateForm('final_harvest', val)} />
                  </div>

                  <FormField label="Harvest method" value={formState.harvest_method ?? ''} onChange={(val) => updateForm('harvest_method', val)} />

                  <div className="flex justify-end gap-3 pt-4 border-t border-deep-navy/10">
                    <button onClick={closeModal} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={clsx(
                        'px-5 py-2 rounded-xl font-semibold flex items-center gap-2',
                        saving ? 'bg-imperial-blue/40 text-white cursor-not-allowed' : 'bg-imperial-blue text-white hover:bg-imperial-blue/90 transition-colors'
                      )}
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {modalMode === 'create' ? 'Create plant' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function StatCard({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: ReactNode }) {
  return (
    <div className="bg-white border border-deep-navy/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-2xl bg-icy-blue/60 flex items-center justify-center text-imperial-blue">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={clsx('text-2xl font-semibold', accent)}>{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/40"
      />
    </div>
  );
}

const SuppliesTab = forwardRef<SuppliesTabHandle>(function SuppliesTab(_, ref) {
  const [supplies, setSupplies] = useState<SupplyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupplyStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState<SupplyRecord | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState<SupplyFormState>(EMPTY_SUPPLY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const loadSupplies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      setTableMissing(false);
      const { data, error: fetchError } = await supplyClient.from(SUPPLIES_TABLE).select('*');
      if (fetchError) throw fetchError;
      const typedData = ((data ?? []) as unknown) as SupplyRecord[];
      setSupplies(typedData);
    } catch (err) {
      console.error('Failed to load supplies', err);
      const supaError = parseSupabaseError(err);
      const missingRelation = supaError?.code === '42P01';
      setTableMissing(missingRelation);
      setError(
        missingRelation
          ? `Supabase could not find the "${SUPPLIES_TABLE}" table. Run docs/tower_supplies_table.md and refresh this page.`
          : supaError?.message ?? 'Unable to load supplies right now.'
      );
      setErrorDetails(supaError?.details ?? null);
      setSupplies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSupplies();
  }, [loadSupplies]);

  const openCreate = useCallback(() => {
    setFormMode('create');
    setFormState(EMPTY_SUPPLY_FORM);
    setFormError(null);
    setImageError(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((record: SupplyRecord) => {
    setFormMode('edit');
    setFormState(mapSupplyToForm(record));
    setFormError(null);
    setImageError(null);
    setFormOpen(true);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      startCreate: () => openCreate(),
    }),
    [openCreate]
  );

  const updateFormField = useCallback(<K extends keyof SupplyFormState>(key: K, value: SupplyFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const closeForm = () => {
    setFormOpen(false);
    setFormError(null);
    setImageError(null);
    setFormState(EMPTY_SUPPLY_FORM);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    supplies.forEach((item) => {
      if (item.category) {
        set.add(item.category);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [supplies]);

  const filteredSupplies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return supplies
      .filter((item) => {
        if (!term) return true;
        const haystack = [
          item.name,
          item.brand,
          item.category,
          item.summary,
          item.description,
          Array.isArray(item.tags) ? item.tags.join(' ') : undefined,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
      .filter((item) => {
        if (statusFilter === 'all') return true;
        return normalizeSupplyStatus(item.status) === statusFilter;
      })
      .filter((item) => {
        if (categoryFilter === 'all') return true;
        return (item.category ?? 'uncategorized') === categoryFilter;
      })
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [supplies, categoryFilter, searchTerm, statusFilter]);

  const handleSaveSupply = async () => {
    const requiredName = formState.name.trim();
    if (!requiredName) {
      setFormError('Name is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      const payload = buildSupplyPayload(formState);

      if (formMode === 'edit' && formState.id !== undefined) {
        const { data, error: updateError } = await supplyClient
          .from(SUPPLIES_TABLE)
          .update(payload)
          .eq('id', formState.id)
          .select()
          .single();

        if (updateError) throw updateError;
        const updated = ((data ?? null) as unknown) as SupplyRecord | null;
        if (updated) {
          setSupplies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }
      } else {
        const { data, error: insertError } = await supplyClient
          .from(SUPPLIES_TABLE)
          .insert(payload)
          .select()
          .single();

        if (insertError) throw insertError;
        const created = ((data ?? null) as unknown) as SupplyRecord | null;
        if (created) {
          setSupplies((prev) => [created, ...prev]);
        }
      }

      closeForm();
    } catch (err) {
      console.error('Failed to save supply', err);
      setFormError(err instanceof Error ? err.message : 'Unable to save supply. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupply = async () => {
    if (!formState.id) return;
    try {
      setDeleting(true);
      setFormError(null);
      const { error: deleteError } = await supplyClient.from(SUPPLIES_TABLE as never).delete().eq('id', formState.id);
      if (deleteError) throw deleteError;
      setSupplies((prev) => prev.filter((item) => item.id !== formState.id));
      setPreviewItem((prev) => (prev?.id === formState.id ? null : prev));
      closeForm();
    } catch (err) {
      console.error('Failed to delete supply', err);
      setFormError(err instanceof Error ? err.message : 'Unable to delete supply.');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setImageError(null);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase();
      const uniqueId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
      const path = `supplies/${uniqueId}-${sanitizedName}`;
      const { data, error: uploadError } = await supplyClient.storage.from(SUPPLIES_BUCKET).upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supplyClient.storage.from(SUPPLIES_BUCKET).getPublicUrl(data.path);
      if (publicUrl?.publicUrl) {
        updateFormField('image_url', publicUrl.publicUrl);
      }
    } catch (err) {
      console.error('Supply image upload failed', err);
      setImageError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const showEmptyState = !loading && filteredSupplies.length === 0 && !error && !tableMissing;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search supplies, brands, or tags…"
            className="w-full rounded-2xl border border-deep-navy/20 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | SupplyStatus)}
            className="rounded-2xl border border-deep-navy/20 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none"
          >
            <option value="all">All statuses</option>
            {SUPPLY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {supplyStatusLabels[status]}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-2xl border border-deep-navy/20 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => void loadSupplies()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-deep-navy/20 px-4 py-2 text-sm font-semibold text-imperial-blue hover:bg-icy-blue/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Unable to load supplies</p>
          <p className="mt-1">{error}</p>
          {errorDetails && <p className="mt-1 text-xs text-red-500">{errorDetails}</p>}
          <button
            onClick={() => void loadSupplies()}
            className="mt-3 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {tableMissing && <SuppliesTableMissingCallout tableName={SUPPLIES_TABLE} />}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => <SupplySkeleton key={`supply-skeleton-${idx}`} />)
          : filteredSupplies.map((item) => (
              <SupplyCard key={item.id} supply={item} onPreview={() => setPreviewItem(item)} onEdit={() => openEdit(item)} />
            ))}
      </div>

      {showEmptyState && (
        <div className="rounded-3xl border border-dashed border-deep-navy/20 bg-icy-blue/30 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-imperial-blue shadow">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No supplies yet</h3>
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            The mobile app doesn't have supply recommendations yet. Add the first item to get started.
          </p>
          <button
            className="mt-6 rounded-2xl bg-imperial-blue px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-imperial-blue/90"
            onClick={openCreate}
          >
            Add supply
          </button>
        </div>
      )}

      <AnimatePresence>
        {previewItem && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <div className="relative">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-500 shadow hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="aspect-video overflow-hidden rounded-t-3xl bg-icy-blue/40">
                  {previewItem.image_url ? (
                    <img src={previewItem.image_url} alt={previewItem.name ?? 'Supply'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-6 p-6 lg:grid-cols-[2fr,1fr]">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{previewItem.category ?? 'Uncategorized'}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{previewItem.name ?? 'Untitled supply'}</h3>
                  {previewItem.brand && <p className="text-sm text-gray-500">Preferred brand • {previewItem.brand}</p>}
                  <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
                    {previewItem.description ?? previewItem.summary ?? 'No description available.'}
                  </p>
                  {Array.isArray(previewItem.tags) && previewItem.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {previewItem.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-icy-blue/70 px-3 py-1 text-xs font-semibold text-imperial-blue">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3 rounded-2xl bg-icy-blue/30 p-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="font-semibold text-gray-900">
                      {supplyStatusLabels[normalizeSupplyStatus(previewItem.status)]}
                    </span>
                  </div>
                  {previewItem.price_range && (
                    <div className="flex justify-between">
                      <span>Price range</span>
                      <span className="font-semibold text-gray-900">{previewItem.price_range}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="font-semibold text-gray-900">{formatSupplyDate(previewItem.updated_at ?? previewItem.created_at)}</span>
                  </div>
                  {previewItem.resource_url && (
                    <a
                      href={previewItem.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-imperial-blue/30 px-3 py-2 font-semibold text-imperial-blue transition hover:bg-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Resource link
                    </a>
                  )}
                  {previewItem.purchase_url && (
                    <a
                      href={previewItem.purchase_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-imperial-blue/30 px-3 py-2 font-semibold text-imperial-blue transition hover:bg-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Purchase link
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setPreviewItem(null);
                      openEdit(previewItem);
                    }}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-imperial-blue px-3 py-2 font-semibold text-white shadow hover:bg-imperial-blue/90"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit supply
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSaveSupply();
              }}
              className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="flex items-center justify-between border-b border-deep-navy/10 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {formMode === 'create' ? 'New supply' : 'Update supply'}
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-900">{formState.name || 'Supply details'}</h3>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-deep-navy/20 p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-6 bg-icy-blue/20 p-6 lg:grid-cols-[3fr,2fr]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={formState.name}
                        onChange={(event) => updateFormField('name', event.target.value)}
                        required
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        value={formState.category}
                        onChange={(event) => updateFormField('category', event.target.value)}
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formState.status}
                        onChange={(event) => updateFormField('status', event.target.value as SupplyStatus)}
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      >
                        {SUPPLY_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {supplyStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Brand</label>
                      <input
                        type="text"
                        value={formState.brand}
                        onChange={(event) => updateFormField('brand', event.target.value)}
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Summary</label>
                    <textarea
                      value={formState.summary}
                      onChange={(event) => updateFormField('summary', event.target.value)}
                      rows={2}
                      className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formState.description}
                      onChange={(event) => updateFormField('description', event.target.value)}
                      rows={6}
                      className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Price range</label>
                      <input
                        type="text"
                        value={formState.price_range}
                        onChange={(event) => updateFormField('price_range', event.target.value)}
                        placeholder="$40 – $60"
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Tags</label>
                      <input
                        type="text"
                        value={formState.tags}
                        onChange={(event) => updateFormField('tags', event.target.value)}
                        placeholder="Comma separated"
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Resource link</label>
                      <input
                        type="url"
                        value={formState.resource_url}
                        onChange={(event) => updateFormField('resource_url', event.target.value)}
                        placeholder="https://"
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Purchase link</label>
                      <input
                        type="url"
                        value={formState.purchase_url}
                        onChange={(event) => updateFormField('purchase_url', event.target.value)}
                        placeholder="https://"
                        className="w-full rounded-2xl border border-deep-navy/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2 rounded-2xl border border-deep-navy/20 bg-white p-4">
                    <label className="text-sm font-medium text-gray-700">Image</label>
                    {formState.image_url ? (
                      <div className="relative overflow-hidden rounded-2xl border border-deep-navy/20">
                        <img src={formState.image_url} alt={formState.name || 'Supply'} className="h-52 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => updateFormField('image_url', '')}
                          className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-deep-navy/20 bg-icy-blue/30 text-sm font-semibold text-imperial-blue">
                        <ImagePlus className="h-6 w-6" />
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleImageUpload(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    <input
                      type="url"
                      value={formState.image_url}
                      onChange={(event) => updateFormField('image_url', event.target.value)}
                      placeholder="…or paste an image URL"
                      className="w-full rounded-2xl border border-deep-navy/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-imperial-blue/30"
                    />
                    {uploadingImage && (
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading image…
                      </p>
                    )}
                    {imageError && <p className="text-xs text-red-600">{imageError}</p>}
                  </div>
                  {formError && <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-deep-navy/10 px-6 py-4">
                {formMode === 'edit' && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteSupply()}
                    disabled={deleting || saving}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {deleting ? 'Removing…' : 'Delete'}
                  </button>
                )}
                <div className="ml-auto flex gap-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-2xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formState.name.trim()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-imperial-blue px-5 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {formMode === 'create' ? 'Add supply' : 'Save changes'}
                  </button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function mapSupplyToForm(record: SupplyRecord): SupplyFormState {
  const tagsValue =
    Array.isArray(record.tags) && record.tags.length
      ? record.tags.join(', ')
      : typeof record.tags === 'string'
      ? record.tags
      : '';
  return {
    id: record.id,
    name: record.name ?? '',
    category: record.category ?? '',
    summary: record.summary ?? '',
    description: record.description ?? '',
    status: normalizeSupplyStatus(record.status),
    price_range: record.price_range ?? '',
    resource_url: record.resource_url ?? '',
    purchase_url: record.purchase_url ?? '',
    image_url: record.image_url ?? '',
    tags: tagsValue,
    brand: record.brand ?? '',
  };
}

function buildSupplyPayload(values: SupplyFormState) {
  const normalize = (input: string) => {
    const trimmed = input.trim();
    return trimmed.length ? trimmed : null;
  };
  const tags = values.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return {
    name: values.name.trim(),
    category: normalize(values.category),
    summary: normalize(values.summary),
    description: normalize(values.description),
    status: values.status || 'draft',
    price_range: normalize(values.price_range),
    resource_url: normalize(values.resource_url),
    purchase_url: normalize(values.purchase_url),
    image_url: normalize(values.image_url),
    brand: normalize(values.brand),
    tags: tags.length ? tags : null,
  };
}

function formatSupplyDate(value?: string | null) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function SupplyCard({ supply, onPreview, onEdit }: { supply: SupplyRecord; onPreview: () => void; onEdit: () => void }) {
  const statusKey = normalizeSupplyStatus(supply.status);
  const badgeClass = supplyStatusStyles[statusKey] ?? supplyStatusStyles.draft;
  const statusLabel = supplyStatusLabels[statusKey] ?? 'Draft';
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-deep-navy/15 bg-white shadow-sm">
      <div className="relative h-48 bg-icy-blue/40">
        {supply.image_url ? (
          <img src={supply.image_url} alt={supply.name ?? 'Supply'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ImagePlus className="h-10 w-10" />
          </div>
        )}
        <span className={clsx('absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold', badgeClass)}>{statusLabel}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{supply.category ?? 'Uncategorized'}</p>
          <h3 className="text-lg font-semibold text-gray-900">{supply.name ?? 'Untitled supply'}</h3>
          {supply.brand && <p className="text-xs text-gray-500">Preferred brand • {supply.brand}</p>}
        </div>
        <p className="line-clamp-3 text-sm text-gray-600">
          {supply.summary ?? supply.description ?? 'Add a short description to help admins recognize this supply.'}
        </p>
        {Array.isArray(supply.tags) && supply.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {supply.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-icy-blue/70 px-3 py-1 text-xs font-medium text-imperial-blue">
                {tag}
              </span>
            ))}
            {supply.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{supply.tags.length - 3} more</span>
            )}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <span>Updated {formatSupplyDate(supply.updated_at ?? supply.created_at)}</span>
          {supply.price_range && <span className="font-semibold text-gray-700">{supply.price_range}</span>}
        </div>
      </div>
      <div className="flex border-t border-deep-navy/10">
        <button
          onClick={onPreview}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-600 transition hover:bg-icy-blue/60"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-2 border-l border-deep-navy/10 py-3 text-sm font-semibold text-imperial-blue transition hover:bg-icy-blue/60"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>
    </div>
  );
}

function SupplySkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-deep-navy/10 bg-white p-4 shadow-sm">
      <div className="mb-4 h-40 rounded-2xl bg-gray-100" />
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-100" />
      <div className="mb-2 h-3 w-full rounded bg-gray-100" />
      <div className="mb-4 h-3 w-2/3 rounded bg-gray-100" />
      <div className="h-8 rounded-2xl bg-gray-100" />
    </div>
  );
}

function SuppliesTableMissingCallout({ tableName }: { tableName: string }) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
      <h3 className="text-lg font-semibold text-amber-900">Supplies table not found</h3>
      <p className="mt-2">
        Supabase returned code <code>42P01</code> for <code>{tableName}</code>. Run the SQL in{' '}
        <code>docs/tower_supplies_table.md</code> via the Supabase SQL editor to create the table, then refresh this page.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5">
        <li>Create the table and policies with the provided script.</li>
        <li>Ensure <code>VITE_SUPPLIES_TABLE</code> matches the table name.</li>
        <li>Create a storage bucket (default <code>supply-images</code>) or update <code>VITE_SUPPLIES_BUCKET</code>.</li>
      </ol>
    </div>
  );
}

function parseSupabaseError(error: unknown): ParsedSupabaseError | null {
  if (!error) {
    return null;
  }

  if (typeof error === 'object') {
    const errObject = error as { code?: string; message?: string; details?: string };
    const code = typeof errObject.code === 'string' ? errObject.code : undefined;
    const message = typeof errObject.message === 'string' ? errObject.message : errObject?.toString?.();
    const details = typeof errObject.details === 'string' ? errObject.details : undefined;
    return { code, message, details };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return null;
}

const FaqsTab = forwardRef<FaqsTabHandle>(function FaqsTab(_, ref) {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formState, setFormState] = useState<FaqFormState>(EMPTY_FAQ_FORM);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<FaqStatusMessage | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedFaq = !isCreating && selectedId ? faqs.find((faq) => faq.id === selectedId) ?? null : null;

  const editDirty = selectedFaq
    ? formState.question !== (selectedFaq.question ?? '') ||
      formState.answer !== (selectedFaq.answer ?? '') ||
      formState.category !== (selectedFaq.category ?? '') ||
      formState.links !== (selectedFaq.links ?? '')
    : false;
  const newEntryHasInput = Object.values(formState).some((value) => value.trim() !== '');
  const isFormDirty = isCreating ? newEntryHasInput : editDirty;
  const hasQuestion = Boolean(formState.question.trim());
  const canSave = hasQuestion && isFormDirty && !saving;

  const startCreateFaq = useCallback(() => {
    setIsCreating(true);
    setSelectedId(null);
    setStatus(null);
    setLibraryError(null);
    setFormState({ ...EMPTY_FAQ_FORM });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      startCreate: () => startCreateFaq(),
    }),
    [startCreateFaq]
  );

  const loadFaqs = useCallback(async () => {
    try {
      setLoading(true);
      setLibraryError(null);

      const { data, error } = await supabase
        .from('tower_faq')
        .select('*')
        .order('category', { ascending: true, nullsFirst: false })
        .order('question', { ascending: true, nullsFirst: false });

      if (error) throw error;

      setFaqs(data ?? []);
      setSelectedId((prev) => {
        if (prev && data?.some((faq) => faq.id === prev)) {
          return prev;
        }
        return data && data.length > 0 ? data[0].id : null;
      });
    } catch (error) {
      console.error('Failed to load FAQs', error);
      const message = error instanceof Error ? error.message : 'Unable to load FAQs right now.';
      setStatus(null);
      setLibraryError(message);
      setFaqs([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFaqs();
  }, [loadFaqs]);

  useEffect(() => {
    if (!selectedFaq || isCreating) {
      return;
    }

    setFormState({
      question: selectedFaq.question ?? '',
      answer: selectedFaq.answer ?? '',
      category: selectedFaq.category ?? '',
      links: selectedFaq.links ?? '',
    });
  }, [selectedFaq, isCreating]);

  const handleChange = (field: keyof FaqFormState, value: string) => {
    setStatus(null);
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    if (isCreating) {
      setFormState({ ...EMPTY_FAQ_FORM });
      setStatus(null);
      return;
    }

    if (!selectedFaq) return;

    setFormState({
      question: selectedFaq.question ?? '',
      answer: selectedFaq.answer ?? '',
      category: selectedFaq.category ?? '',
      links: selectedFaq.links ?? '',
    });
    setStatus(null);
  };

  const handleSave = async () => {
    const normalizedQuestion = formState.question.trim();
    if (!normalizedQuestion) {
      setStatus({ type: 'error', message: 'Question is required.' });
      return;
    }

    try {
      setSaving(true);
      setStatus(null);

      const payload = {
        question: normalizedQuestion,
        answer: formState.answer.trim() || null,
        category: formState.category.trim() || null,
        links: formState.links.trim() || null,
      };

      if (isCreating) {
        const newId = faqs.length > 0 ? Math.max(...faqs.map((faq) => faq.id)) + 1 : 1;
        const { data, error } = await supabase
          .from('tower_faq')
          .insert({ id: newId, ...payload })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setFaqs((prev) => {
            const normalizeCategory = (value: string | null) =>
              value && value.trim() ? value.trim().toLowerCase() : '\uffff';
            const normalizeQuestion = (value: string | null) => value?.trim().toLowerCase() ?? '';

            return [...prev, data].sort((a, b) => {
              const categoryComparison = normalizeCategory(a.category).localeCompare(
                normalizeCategory(b.category)
              );
              if (categoryComparison !== 0) return categoryComparison;

              const questionComparison = normalizeQuestion(a.question).localeCompare(
                normalizeQuestion(b.question)
              );
              if (questionComparison !== 0) return questionComparison;

              return a.id - b.id;
            });
          });
          setSelectedId(data.id);
        } else {
          await loadFaqs();
        }

        setIsCreating(false);
        setStatus({ type: 'success', message: 'FAQ created successfully.' });
      } else if (selectedFaq) {
        const { error } = await supabase.from('tower_faq').update(payload).eq('id', selectedFaq.id);
        if (error) throw error;

        setFaqs((prev) =>
          prev.map((faq) => (faq.id === selectedFaq.id ? { ...faq, ...payload } : faq))
        );
        setStatus({ type: 'success', message: 'FAQ updated successfully.' });
      }
    } catch (error) {
      console.error('Failed to save FAQ', error);
      const message = error instanceof Error ? error.message : 'Unable to save your changes.';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const renderEmptyState = () => (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-500">
      {loading ? (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-imperial-blue" />
          <p>Loading FAQs…</p>
        </>
      ) : (
        <>
          <HelpCircle className="h-10 w-10 text-imperial-blue/60" />
          <p>Select an FAQ entry or create a new one to view its details.</p>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-1/3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">FAQ Library</p>
              <p className="text-sm text-gray-600">Select an entry to preview and edit.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCreateFaq}
                className="inline-flex items-center gap-1 rounded-full bg-imperial-blue/10 px-3 py-1.5 text-xs font-semibold text-imperial-blue hover:bg-imperial-blue/20"
              >
                <Plus className="h-3.5 w-3.5" />
                New FAQ
              </button>
              <button
                type="button"
                onClick={() => void loadFaqs()}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-full border border-deep-navy/20 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-icy-blue/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Refresh
              </button>
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto rounded-3xl border border-deep-navy/20 bg-white shadow-inner">
            {loading ? (
              <div className="space-y-2 p-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse space-y-2 rounded-2xl bg-icy-blue/40 p-4">
                    <div className="h-3 w-24 rounded bg-icy-blue/70" />
                    <div className="h-4 w-48 rounded bg-icy-blue/70" />
                    <div className="h-3 w-40 rounded bg-icy-blue/60" />
                  </div>
                ))}
              </div>
            ) : libraryError ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-red-600">
                <AlertCircle className="h-8 w-8" />
                <p className="font-semibold">We couldn't load the FAQs.</p>
                <p className="text-xs text-gray-500">{libraryError}</p>
                <button
                  type="button"
                  onClick={() => void loadFaqs()}
                  className="rounded-xl bg-imperial-blue/10 px-4 py-2 text-xs font-semibold text-imperial-blue"
                >
                  Try again
                </button>
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-sm text-gray-500">
                <HelpCircle className="h-8 w-8 text-imperial-blue/60" />
                <p>No FAQs found.</p>
                <p className="text-xs text-gray-400">Use the “New FAQ” button to add the first entry.</p>
              </div>
            ) : (
              <ul className="divide-y divide-deep-navy/10">
                {faqs.map((faq) => {
                  const isActive = !isCreating && faq.id === selectedId;
                  return (
                    <li key={faq.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setSelectedId(faq.id);
                          setStatus(null);
                        }}
                        className={clsx(
                          'w-full p-4 text-left transition-colors',
                          isActive ? 'bg-icy-blue/70' : 'hover:bg-icy-blue/40'
                        )}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          {faq.category || 'Uncategorized'}
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
                          {faq.question || 'Untitled question'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {faq.answer ? faq.answer : 'No answer yet.'}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex-1 rounded-3xl border border-deep-navy/20 bg-gradient-to-br from-icy-blue/20 to-white p-6 shadow-lg">
          {!selectedFaq && !isCreating ? (
            renderEmptyState()
          ) : (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (canSave) {
                  void handleSave();
                }
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {isCreating ? 'New entry' : `FAQ #${selectedFaq?.id}`}
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {isCreating ? 'Create FAQ' : 'Edit FAQ'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isCreating
                      ? 'Draft a new question that will surface in the mobile app.'
                      : selectedFaq?.category || 'Categorize this FAQ to group it in the app.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!isFormDirty || saving}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreating ? 'Clear' : 'Reset'}
                  </button>
                  <button
                    type="submit"
                    disabled={!canSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-imperial-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-imperial-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isCreating ? 'Create FAQ' : 'Save changes'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {status && (
                <div
                  className={clsx(
                    'flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm',
                    status.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-700'
                  )}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <p className="font-medium">{status.message}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Question</label>
                <input
                  type="text"
                  value={formState.question}
                  onChange={(event) => handleChange('question', event.target.value)}
                  className="w-full rounded-2xl border border-deep-navy/20 px-4 py-3 text-sm shadow-sm focus:border-imperial-blue focus:outline-none"
                  placeholder="What question are users asking?"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Answer</label>
                <textarea
                  value={formState.answer}
                  onChange={(event) => handleChange('answer', event.target.value)}
                  className="min-h-[160px] w-full rounded-2xl border border-deep-navy/20 px-4 py-3 text-sm shadow-sm focus:border-imperial-blue focus:outline-none"
                  placeholder="Provide a clear, helpful answer..."
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formState.category}
                    onChange={(event) => handleChange('category', event.target.value)}
                    className="w-full rounded-2xl border border-deep-navy/20 px-4 py-3 text-sm shadow-sm focus:border-imperial-blue focus:outline-none"
                    placeholder="e.g. Getting Started"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Links (optional)</label>
                  <textarea
                    value={formState.links}
                    onChange={(event) => handleChange('links', event.target.value)}
                    className="min-h-[56px] w-full rounded-2xl border border-deep-navy/20 px-4 py-3 text-sm shadow-sm focus:border-imperial-blue focus:outline-none"
                    rows={2}
                    placeholder="Plain text, Markdown, or JSON-formatted links"
                  />
                  <p className="text-[11px] text-gray-500">Use JSON or newline-separated URLs – we store exactly what you paste.</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});
