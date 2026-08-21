import { useState } from 'react';

import { goalCategoryLabels, goalStatusLabels } from '../../constants/goals.js';
import { formatDate } from '../../utils/formatters.js';

const statusClasses = {
  completed: 'bg-emerald-500/10 text-emerald-300',
  'on-track': 'bg-sky-500/10 text-sky-300',
  behind: 'bg-rose-500/10 text-rose-300',
  'no-data': 'bg-amber-500/10 text-amber-300',
};

function GoalCard({ action, currency, formatCurrency, goal, onContribute, onDelete, onEdit }) {
  const [contribution, setContribution] = useState('');
  const [contributionError, setContributionError] = useState('');
  const isContributing = action.id === goal._id && action.type === 'contribute';
  const isDeleting = action.id === goal._id && action.type === 'delete';
  const isBusy = Boolean(action.id);
  const progress = goal.progress;
  const progressWidth = Math.min(Math.max(progress.percentageComplete, 0), 100);
  const isComplete = progress.amountRemaining === 0;

  const submitContribution = async (event) => {
    event.preventDefault();
    const amount = Number(contribution);

    if (!Number.isFinite(amount) || amount <= 0) {
      setContributionError('Enter an amount greater than zero.');
      return;
    }

    if (amount > progress.amountRemaining) {
      setContributionError(
        `Maximum contribution is ${formatCurrency(progress.amountRemaining, currency)}.`,
      );
      return;
    }

    setContributionError('');

    try {
      await onContribute(goal, amount);
      setContribution('');
    } catch (error) {
      setContributionError(error.message);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
            {goalCategoryLabels[goal.category]}
          </span>
          <h2 className="mt-3 truncate text-xl font-semibold text-white">{goal.name}</h2>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[progress.status]}`}
        >
          {goalStatusLabels[progress.status]}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Saved</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatCurrency(goal.currentAmount, currency)}
          </p>
        </div>
        <p className="text-right text-sm text-slate-400">
          of {formatCurrency(goal.targetAmount, currency)}
        </p>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all"
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
        <span className="font-semibold text-emerald-300">
          {progress.percentageComplete}% complete
        </span>
        <span className="break-words text-slate-500 sm:text-right">
          {formatCurrency(progress.amountRemaining, currency)} remaining
        </span>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-950/70 p-3">
          <dt className="text-xs text-slate-500">Target date</dt>
          <dd className="mt-1 font-medium text-slate-200">{formatDate(goal.targetDate)}</dd>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-3">
          <dt className="text-xs text-slate-500">Projected completion</dt>
          <dd className="mt-1 font-medium text-slate-200">
            {progress.projectedCompletionDate
              ? formatDate(progress.projectedCompletionDate)
              : 'Waiting for contribution history'}
          </dd>
        </div>
      </dl>

      {!isComplete && (
        <form className="mt-6" onSubmit={submitContribution} noValidate>
          <label
            className="text-sm font-medium text-slate-200"
            htmlFor={`contribution-${goal._id}`}
          >
            Quick contribution
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={`contribution-${goal._id}`}
              type="number"
              min="0.01"
              max={progress.amountRemaining}
              step="0.01"
              inputMode="decimal"
              value={contribution}
              onChange={(event) => {
                setContribution(event.target.value);
                setContributionError('');
              }}
              placeholder="Amount"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {isContributing ? 'Adding…' : 'Contribute'}
            </button>
          </div>
          {contributionError && <p className="mt-1.5 text-sm text-rose-400">{contributionError}</p>}
        </form>
      )}

      <div className="mt-6 flex gap-2 border-t border-slate-800 pt-4">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onEdit(goal)}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(goal)}
          className="ml-auto rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default GoalCard;
