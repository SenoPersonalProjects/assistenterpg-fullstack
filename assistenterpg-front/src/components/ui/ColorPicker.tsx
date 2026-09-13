'use client';

const DEFAULT_COLOR = '#7c5cfc';

export const DEFAULT_COLOR_PRESETS = [
  '#7c5cfc',
  '#06b6d4',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#64748b',
] as const;

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  presets?: readonly string[];
};

function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function ColorPicker({
  label,
  value,
  onChange,
  helperText,
  presets = DEFAULT_COLOR_PRESETS,
}: ColorPickerProps) {
  const selectedColor = isHexColor(value) ? value : DEFAULT_COLOR;

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-app-fg">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((color) => {
          const selected = color.toLowerCase() === selectedColor.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              aria-label={`Usar cor ${color}`}
              aria-pressed={selected}
              className={`h-8 w-8 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary ${
                selected ? 'border-app-fg scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          );
        })}
        <label className="flex h-8 items-center gap-2 rounded-lg border border-app-border bg-app-surface px-2 text-xs text-app-muted">
          Personalizada
          <input
            type="color"
            aria-label={`${label}: cor personalizada`}
            value={selectedColor}
            className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
      {helperText ? <p className="text-xs text-app-muted">{helperText}</p> : null}
      {!isHexColor(value) && value ? <p className="text-xs text-app-warning">A cor legada será substituída quando uma opção for escolhida.</p> : null}
    </div>
  );
}
