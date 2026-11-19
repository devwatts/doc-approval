/** Join class names, skipping falsy values: cn('a', isOn && 'b') */
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

/** Tailwind classes shared by elements that don't need their own component. */
export const styles = {
  card: 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900',
  label: 'flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300',
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-slate-400 ' +
    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-60 ' +
    'aria-invalid:border-rose-500 dark:border-slate-700 dark:bg-slate-950',
  error: 'text-sm font-normal text-rose-600 dark:text-rose-400',
  muted: 'text-slate-500 dark:text-slate-400',
}
