import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '../api/client.js';
import NetWorthTrendChart from '../components/dashboard/NetWorthTrendChart.jsx';
import AssetAllocationChart from '../components/wealth/AssetAllocationChart.jsx';
import AssetForm from '../components/wealth/AssetForm.jsx';
import AssetTable from '../components/wealth/AssetTable.jsx';
import SavingsRateChart from '../components/wealth/SavingsRateChart.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { assetTypeLabels, assetTypes } from '../constants/assets.js';
import { useAuth } from '../hooks/useAuth.js';
import { mapApiErrors } from '../utils/formErrors.js';
import { formatCurrency, toDateInputValue } from '../utils/formatters.js';

const today = toDateInputValue(new Date());
const emptyAssetForm = { type: 'stocks', name: '', currentValue: '', dateUpdated: today };
const ranges = [
  { value: '3mo', label: '3 mo' },
  { value: '6mo', label: '6 mo' },
  { value: '1yr', label: '1 year' },
  { value: 'all', label: 'All' },
];

function WealthAnalytics() {
  const { user } = useAuth();
  const currency = user.financialProfile?.currency ?? 'USD';
  const [assets, setAssets] = useState([]);
  const [history, setHistory] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [range, setRange] = useState('6mo');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [assetForm, setAssetForm] = useState(emptyAssetForm);
  const [assetErrors, setAssetErrors] = useState({});
  const [editingId, setEditingId] = useState('');
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [hasUnsnapshottedChanges, setHasUnsnapshottedChanges] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [assetResult, historyResult, reportResult] = await Promise.all([
        api.getAssets(),
        api.getNetWorthHistory(range),
        api.getMonthlyReport(12),
      ]);
      setAssets(assetResult.assets);
      setHistory(historyResult.snapshots);
      setMonthlyReport(reportResult.months);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allocation = useMemo(() => {
    const values = new Map();

    for (const asset of assets) {
      values.set(asset.type, (values.get(asset.type) ?? 0) + asset.currentValue);
    }

    return [...values.entries()]
      .map(([type, value]) => ({ type, name: assetTypeLabels[type], value }))
      .sort((first, second) => second.value - first.value);
  }, [assets]);

  const updateAssetForm = (event) => {
    setAssetForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setAssetErrors((current) => ({ ...current, [event.target.name]: undefined, form: undefined }));
  };

  const cancelAssetEdit = () => {
    setEditingId('');
    setAssetForm(emptyAssetForm);
    setAssetErrors({});
  };

  const saveAsset = async (event) => {
    event.preventDefault();
    const errors = {};
    const currentValue = Number(assetForm.currentValue);

    if (!assetTypes.includes(assetForm.type)) errors.type = 'Choose a valid asset type.';
    if (assetForm.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!Number.isFinite(currentValue) || currentValue < 0) {
      errors.currentValue = 'Enter a value of zero or greater.';
    }
    if (!assetForm.dateUpdated) errors.dateUpdated = 'Choose a valuation date.';

    if (Object.keys(errors).length) {
      setAssetErrors(errors);
      return;
    }

    setIsSavingAsset(true);
    setAssetErrors({});
    setError('');

    try {
      const values = {
        type: assetForm.type,
        name: assetForm.name.trim(),
        currentValue,
        dateUpdated: assetForm.dateUpdated,
      };
      const result = editingId
        ? await api.updateAsset(editingId, values)
        : await api.createAsset(values);

      setAssets((current) =>
        editingId
          ? current.map((asset) => (asset._id === editingId ? result.asset : asset))
          : [result.asset, ...current],
      );
      setHasUnsnapshottedChanges(true);
      cancelAssetEdit();
    } catch (requestError) {
      setAssetErrors({ ...mapApiErrors(requestError), form: requestError.message });
    } finally {
      setIsSavingAsset(false);
    }
  };

  const editAsset = (asset) => {
    setEditingId(asset._id);
    setAssetForm({
      type: asset.type,
      name: asset.name,
      currentValue: String(asset.currentValue),
      dateUpdated: asset.dateUpdated.slice(0, 10),
    });
    setAssetErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAsset = async (asset) => {
    if (!window.confirm(`Delete “${asset.name}” from your assets?`)) return;

    const snapshot = assets;
    setBusyId(asset._id);
    setAssets((current) => current.filter((item) => item._id !== asset._id));

    try {
      await api.deleteAsset(asset._id);
      setHasUnsnapshottedChanges(true);
      if (editingId === asset._id) cancelAssetEdit();
    } catch (requestError) {
      setAssets(snapshot);
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  };

  const createSnapshot = async () => {
    setIsSnapshotting(true);
    setError('');

    try {
      await api.createNetWorthSnapshot();
      const result = await api.getNetWorthHistory(range);
      setHistory(result.snapshots);
      setHasUnsnapshottedChanges(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Portfolio perspective</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Wealth Analytics
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Understand allocation, historical net worth, and how consistently monthly income becomes
            savings.
          </p>
        </div>
        <button
          type="button"
          disabled={isSnapshotting}
          onClick={createSnapshot}
          className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isSnapshotting ? 'Recording…' : 'Record net worth snapshot'}
        </button>
      </header>

      {hasUnsnapshottedChanges && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Asset values changed. Record a snapshot when you want those values added to net worth
          history.
        </p>
      )}
      {error && (
        <p
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <AssetForm
        values={assetForm}
        errors={assetErrors}
        isEditing={Boolean(editingId)}
        isSubmitting={isSavingAsset}
        onChange={updateAssetForm}
        onSubmit={saveAsset}
        onCancel={cancelAssetEdit}
      />

      {isLoading ? (
        <PageSkeleton label="Loading wealth analytics" cards={2} />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <AssetAllocationChart
              allocation={allocation}
              currency={currency}
              formatCurrency={formatCurrency}
            />
            <div>
              <div className="mb-3 flex justify-end gap-2">
                {ranges.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      range === option.value
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <NetWorthTrendChart
                snapshots={history}
                currency={currency}
                formatCurrency={formatCurrency}
                title="Net worth growth"
              />
            </div>
          </div>
          <SavingsRateChart months={monthlyReport} />
          <AssetTable
            assets={assets}
            busyId={busyId}
            currency={currency}
            formatCurrency={formatCurrency}
            onEdit={editAsset}
            onDelete={deleteAsset}
          />
        </>
      )}
    </div>
  );
}

export default WealthAnalytics;
