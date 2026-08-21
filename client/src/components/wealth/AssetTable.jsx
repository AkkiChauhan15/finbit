import { assetTypeLabels } from '../../constants/assets.js';
import { formatDate } from '../../utils/formatters.js';

function AssetTable({ assets, busyId, currency, formatCurrency, onDelete, onEdit }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#cbd7ce] bg-white shadow-soft">
      <div className="border-b border-[#cbd7ce] px-5 py-4 sm:px-6">
        <h2 className="text-xl font-semibold text-[#161d19]">Assets & investments</h2>
        <p className="mt-1 text-sm text-[#6c7a71]">
          Keep valuations current before recording a snapshot.
        </p>
      </div>
      {assets.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-[#6c7a71]">
          Add your first asset to build an allocation view.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#f4fbf4] text-xs uppercase tracking-wide text-[#6c7a71]">
              <tr>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e2d9]">
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td className="px-6 py-4 font-medium text-[#26352c]">{asset.name}</td>
                  <td className="px-6 py-4 text-[#536158]">{assetTypeLabels[asset.type]}</td>
                  <td className="px-6 py-4 font-semibold text-[#006e24]">
                    {formatCurrency(asset.currentValue, currency)}
                  </td>
                  <td className="px-6 py-4 text-[#536158]">{formatDate(asset.dateUpdated)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => onEdit(asset)}
                        className="rounded-md border border-[#b9c8bd] px-2.5 py-1.5 text-xs text-[#35443a] hover:bg-[#e8f0e9] disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => onDelete(asset)}
                        className="rounded-md border border-rose-500/30 px-2.5 py-1.5 text-xs text-[#a43a3a] hover:bg-rose-500/10 disabled:opacity-50"
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
