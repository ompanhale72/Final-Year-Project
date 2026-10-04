export default function Metric({ label, value, tone = "ink" }) {
  const tones = {
    ink: "text-ink bg-white",
    mint: "text-mint bg-mint/10",
    coral: "text-coral bg-coral/10",
    saffron: "text-ink bg-saffron/20",
  };
  return (
    <div className={`rounded-lg p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-semibold opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
