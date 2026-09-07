/**
 * Credibility row under the hero. Everything here is drawn from the real partner
 * factories in ManufacturerShowcase — the brands are ones those factories already
 * produce for, and the figures are their combined published capacity.
 */
const producedFor = ['Walmart', 'Costco', 'Champion', 'Old Navy', 'Hanes', 'Jack & Jones'];

const stats = [
  { value: '5', label: 'Partner factories' },
  { value: '60,000+', label: 'Garments produced daily' },
  { value: '4,000+', label: 'Skilled workers' },
];

export function ProofStrip() {
  return (
    <div className="proof-strip">
      <div className="proof-brands">
        <span className="proof-label">OUR PARTNER FACTORIES ALREADY PRODUCE FOR</span>
        <div className="proof-brand-row">
          {producedFor.map(brand => <span key={brand}>{brand}</span>)}
        </div>
      </div>
      <dl className="proof-stats">
        {stats.map(stat => (
          <div key={stat.label}>
            <dt>{stat.value}</dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
