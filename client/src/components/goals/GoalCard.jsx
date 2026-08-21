import { useState } from 'react';

import { goalCategoryLabels, goalStatusLabels } from '../../constants/goals.js';
import { formatDate } from '../../utils/formatters.js';

const statusClasses = {
  completed: 'bg-[#00bc44]/10 text-[#006e24]',
  'on-track': 'bg-sky-500/10 text-[#4648d4]',
  behind: 'bg-rose-500/10 text-[#a43a3a]',
  'no-data': 'bg-amber-500/10 text-[#805600]',
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
    <article className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-[#4648d4]">
            {goalCategoryLabels[goal.category]}
          </span>
          <h2 className="mt-3 truncate text-xl font-semibold text-[#161d19]">{goal.name}</h2>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[progress.status]}`}
        >
          {goalStatusLabels[progress.status]}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#6c7a71]">Saved</p>
          <p className="mt-1 text-2xl font-bold text-[#161d19]">
            {formatCurrency(goal.currentAmount, currency)}
          </p>
        </div>
        <p className="text-right text-sm text-[#536158]">
          of {formatCurrency(goal.targetAmount, currency)}
        </p>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e8f0e9]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00a83d] to-[#4648d4] transition-all"
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4">
        <span className="font-semibold text-[#006e24]">
          {progress.percentageComplete}% complete
        </span>
        <span className="break-words text-[#6c7a71] sm:text-right">
          {formatCurrency(progress.amountRemaining, currency)} remaining
        </span>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[#f4fbf4] p-3">
          <dt className="text-xs text-[#6c7a71]">Target date</dt>
          <dd className="mt-1 font-medium text-[#26352c]">{formatDate(goal.targetDate)}</dd>
        </div>
        <div className="rounded-xl bg-[#f4fbf4] p-3">
          <dt className="text-xs text-[#6c7a71]">Projected completion</dt>
          <dd className="mt-1 font-medium text-[#26352c]">
            {progress.projectedCompletionDate
              ? formatDate(progress.projectedCompletionDate)
              : 'Waiting for contribution history'}
          </dd>
        </div>
      </dl>

      {!isComplete && (
        <form className="mt-6" onSubmit={submitContribution} noValidate>
          <label
            className="text-sm font-medium text-[#26352c]"
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
              className="min-w-0 flex-1 rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none placeholder:text-[#87938b] focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-lg bg-[#00bc44] px-4 py-2.5 text-sm font-semibold text-[#161d19] hover:bg-[#18c950] disabled:opacity-50"
            >
              {isContributing ? 'Adding…' : 'Contribute'}
            </button>
          </div>
          {contributionError && (
            <p className="mt-1.5 text-sm text-[#a43a3a]">{contributionError}</p>
          )}
        </form>
      )}

      <div className="mt-6 flex gap-2 border-t border-[#cbd7ce] pt-4">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onEdit(goal)}
          className="rounded-lg border border-[#b9c8bd] px-3 py-2 text-sm text-[#35443a] hover:bg-[#e8f0e9] disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(goal)}
          className="ml-auto rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-[#a43a3a] hover:bg-rose-500/10 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default GoalCard;
