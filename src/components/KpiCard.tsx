import { formatCurrency } from '@/lib/utils';

type ColorClass = 'text-success' | 'text-destructive' | 'text-muted-foreground';

export default function KpiCard({
  label, value, color, sign,
}: {
  label: string;
  value: number;
  color: ColorClass;
  sign: string;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-up">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-extrabold ${color} leading-none`}>
        {sign}{formatCurrency(value)}
      </p>
    </div>
  );
}
