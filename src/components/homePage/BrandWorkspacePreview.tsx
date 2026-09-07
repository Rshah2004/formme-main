import { useState } from 'react';
import { ArrowRight, Check, CheckCheck } from 'lucide-react';
import './brand-workspace-preview.css';

type View = 'approval' | 'updates' | 'milestone';

export function BrandWorkspacePreview() {
  const [view, setView] = useState<View>('approval');
  const [decision, setDecision] = useState<'pending' | 'approved' | 'revision'>('pending');
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const tabs = [
    { id: 'approval' as const, title: 'Samples', label: 'Needs your approval' },
    { id: 'updates' as const, title: 'Updates', label: 'Production updates' },
    { id: 'milestone' as const, title: 'Next steps', label: 'What happens next' },
  ];
  return <section className="production-section brand-workspace-section" id="product" aria-labelledby="brand-workspace-title">
    <div className="production-container">
      <div className="production-section-heading"><div><span className="production-eyebrow">YOUR BRAND WORKSPACE</span><h2 id="brand-workspace-title">Less chasing.<br />More creating.</h2></div><p>We coordinate the production. You stay close to the decisions that shape your collection.</p><ul className="workspace-benefits"><li><Check size={16} /><span>Approve samples before production</span></li><li><Check size={16} /><span>Read updates from your Formme team</span></li><li><Check size={16} /><span>Know what’s next for your order</span></li></ul><span className="workspace-preview-hint">Try a sample approval in the preview <ArrowRight size={15} /></span></div>
      <div className="brand-workspace-demo">
        <div className="brand-workspace-toolbar"><span><img src="/logo-mark.png" alt="" /> Your workspace</span><span>Interactive preview</span></div>
        <div className="brand-workspace-body">
          <div className="brand-workspace-tabs" role="tablist" aria-label="Explore your brand workspace" aria-orientation="horizontal">{tabs.map(({ id, title, label }, index) => <button key={id} type="button" role="tab" id={`workspace-tab-${id}`} aria-label={label} aria-selected={view === id} aria-controls="workspace-panel" tabIndex={view === id ? 0 : -1} onClick={() => setView(id)} onKeyDown={event => {
            let next: number | undefined;
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            if (next !== undefined) { event.preventDefault(); setView(tabs[next].id); document.getElementById(`workspace-tab-${tabs[next].id}`)?.focus(); }
          }}><span>{title}</span>{id === 'approval' && decision === 'pending' && <small>1</small>}</button>)}</div>
          <div className="brand-workspace-panel" id="workspace-panel" role="tabpanel" aria-labelledby={`workspace-tab-${view}`} tabIndex={0}>
            <div className={`workspace-view workspace-view-${view}`} key={view}>
            {view === 'approval' && <>
              <div className="workspace-review-heading"><span className={`workspace-status workspace-status-${decision}`}>{decision === 'pending' ? 'Ready for your review' : decision === 'approved' ? 'Approved in preview' : 'Revision requested'}</span><span>Sample 02</span></div>
              <div className="workspace-sample-card"><figure className="is-photo"><span className="workspace-sketch-label">SAMPLE 02</span><img src="/images/blue-shirt-editorial.jpg" alt="Sky-blue everyday shirt, photographed on a rail" /><figcaption>Illustrative sample</figcaption></figure><div><span className="workspace-sample-eyebrow">YOUR FEEDBACK, MADE REAL</span><h3>The everyday shirt</h3><p>You asked for a narrower cuff.<br />Here’s the revision.</p><div className="workspace-cuff-comparison" aria-label="Example cuff revision from 10.5 centimetres to 9 centimetres"><div><span>Previous cuff</span><del>10.5<small> cm</small></del></div><ArrowRight size={17} aria-hidden="true" /><div><span>Revised cuff</span><strong>9.0<small> cm</small><Check size={13} aria-hidden="true" /></strong></div></div></div></div>
              <details className="workspace-measurement-details"><summary>Compare sample measurements<span>3 checked</span></summary><table className="workspace-measurements"><caption className="sr-only">Example sample measurements against your specification</caption><thead><tr><th scope="col">Measurement</th><th scope="col">Your spec</th><th scope="col">Sample 02</th></tr></thead><tbody><tr><th scope="row">Chest (½)</th><td>56.0 cm</td><td>56.2 cm</td></tr><tr><th scope="row">Body length</th><td>74.0 cm</td><td>74.0 cm</td></tr><tr className="is-revised"><th scope="row">Cuff width</th><td>9.0 cm</td><td>9.0 cm <span>revised</span></td></tr></tbody></table></details>
              <div className="workspace-change-note"><div><strong>Your fit. Your approval.</strong><p>All three measurements are within your ±1 cm tolerance. Your approval gives the factory its reference for production.</p></div></div>
              {decision === 'pending' && !editing && <><div className="workspace-actions"><button type="button" onClick={() => setDecision('approved')}>Approve sample <Check size={15} /></button><button type="button" className="workspace-secondary" onClick={() => setEditing(true)}>Request a revision</button></div>
              {/* Photos and measurements are how most rounds get reviewed, but the
                  obvious question is whether you ever hold the garment. Say so. */}
              <p className="workspace-sample-option">Rather hold it first? Ask us to ship the sample to you before you decide.</p></>}
              {editing && <form className="workspace-feedback" onSubmit={event => { event.preventDefault(); if (feedback.trim()) { setDecision('revision'); setEditing(false); } }}><label htmlFor="workspace-feedback">What would you like changed?</label><textarea id="workspace-feedback" value={feedback} onChange={event => setFeedback(event.target.value)} required maxLength={500} placeholder="For example: make the cuff slightly narrower." /><div className="workspace-actions"><button type="submit" disabled={!feedback.trim()}>Save example feedback</button><button type="button" className="workspace-secondary" onClick={() => setEditing(false)}>Cancel</button></div></form>}
              {decision !== 'pending' && <div className="workspace-result" role="status"><CheckCheck size={20} /><div><strong>{decision === 'approved' ? 'Your decision is recorded in this preview.' : 'Your feedback is saved in this preview.'}</strong><p>{decision === 'approved' ? 'In Formme, your team can see the approval and coordinate the next step.' : feedback}</p><button type="button" onClick={() => { setDecision('pending'); setFeedback(''); }}>Reset example</button></div></div>}
            </>}
            {view === 'updates' && <><span className="workspace-status workspace-status-info">FROM YOUR FORMME TEAM</span><h3>The everyday shirt.<br />Moving forward.</h3><p>Example updates show what changed and what your team is doing next.</p><div className="workspace-update-timeline"><div className="workspace-update is-latest"><span><img src="/logo-mark.png" alt="Formme" /></span><div><small>Example update · Today</small><strong>Cutting is complete. Sewing is underway.</strong><p>The fabric passed inspection and the factory has started sewing. Your Formme team is coordinating the quality review.</p><span className="workspace-update-stage"><i /> Target shipment · 18 Sep</span></div></div><div className="workspace-update"><span><Check size={17} /></span><div><small>Example update · Yesterday</small><strong>Your cuff revision is in the production brief.</strong><p>The factory has the updated 9 cm measurement and revised sample as its reference.</p></div></div></div></>}
            {view === 'milestone' && <><span className="workspace-status workspace-status-info">LOOKING AHEAD</span><h3>Checked before<br />it leaves the factory.</h3><p>Your Formme team coordinates the review and shares the findings with your order.</p><div className="workspace-checkpoint-ticket"><div className="workspace-milestone"><div><span>NEXT MILESTONE</span><strong>Production quality review</strong><ul className="workspace-quality-checks"><li>Measurements against your sample</li><li>Stitching, buttons, and finish</li><li>Quantity and packing details</li></ul></div></div><div className="workspace-delivery"><span>Target shipment date<small>Illustrative timeline</small></span><strong><span>SEP</span>18</strong></div></div><div className="workspace-no-action"><CheckCheck size={16} /> We’ll share the review. You’ll know what’s next.</div></>}
            </div>
          </div>
        </div>
        <p className="brand-workspace-disclaimer">Try the preview. Decisions here are examples and don’t affect a real order.</p>
      </div>
    </div>
  </section>;
}
