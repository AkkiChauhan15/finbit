import { assetTypeLabels } from '../../constants/assets.js';
import { formatDate } from '../../utils/formatters.js';

function AssetTable({ assets, busyId, currency, formatCurrency, onDelete, onEdit }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-semibold text-white">Assets & investments</h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep valuations current before recording a snapshot.
        </p>
      </div>
      {assets.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-slate-500">
          Add your first asset to build an allocation view.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td className="px-6 py-4 font-medium text-slate-200">{asset.name}</td>
                  <td className="px-6 py-4 text-slate-400">{assetTypeLabels[asset.type]}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-300">
                    {formatCurrency(asset.currentValue, currency)}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(asset.dateUpdated)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => onEdit(asset)}
                        className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => onDelete(asset)}
                        className="rounded-md border border-rose-500/30 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        {busyId === asset._id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AssetTable;
