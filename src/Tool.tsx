// Afterward: a calm checklist and account register for the person handling a loved one's affairs after a death.
import { useState } from "react";
import { uid, useStored } from "./lib/store";
import { Section, Stat, Stats } from "./ui/kit";

const T = "afterward";
type Task = { id: string; stage: string; text: string; done: boolean; note: string };
type Account = { id: string; name: string; kind: string; ref: string; contact: string; status: "to notify" | "notified" | "closed" | "transferred"; needs: string; note: string };
type Doc = { id: string; name: string; have: boolean; copies: number; where: string };
const STAGES = ["First days", "First two weeks", "First months", "Later"];
const TASKS: [string, string][] = [
  ["First days", "Get the medical certificate of death"], ["First days", "Register the death at the civil registry and ask for several certified copies"],
  ["First days", "Tell close family and friends"], ["First days", "Arrange the funeral or burial"], ["First days", "Secure the home, car and valuables"],
  ["First days", "Look for a will and any funeral wishes"], ["First two weeks", "Tell the employer or pension fund"], ["First two weeks", "Tell the banks and freeze joint cards if needed"],
  ["First two weeks", "Contact a notary about the estate"], ["First two weeks", "Redirect post"], ["First two weeks", "Cancel phone, internet and subscriptions"],
  ["First months", "List everything owned and owed"], ["First months", "Tell the tax office and file the final return"], ["First months", "Claim life insurance and any benefits"],
  ["First months", "Close or transfer utilities"], ["First months", "Deal with social media and email accounts"], ["Later", "Share out the estate as the will or law says"], ["Later", "Keep records of everything for at least five years"],
];
const DOCS: Doc[] = [
  { id: "d1", name: "Death certificate (certified copies)", have: false, copies: 0, where: "" }, { id: "d2", name: "Birth and marriage certificates", have: false, copies: 0, where: "" },
  { id: "d3", name: "National ID card", have: true, copies: 1, where: "Kitchen drawer" }, { id: "d4", name: "Will", have: false, copies: 0, where: "" },
  { id: "d5", name: "Property deeds", have: false, copies: 0, where: "" }, { id: "d6", name: "Bank statements (last 3 months)", have: false, copies: 0, where: "" },
];
const KINDS = ["Bank", "Pension", "Insurance", "Utility", "Phone and internet", "Subscription", "Loan or credit", "Government", "Online account", "Other"];

export default function Afterward() {
  const [who, setWho] = useStored(T, "who", { name: "", date: "" });
  const [tasks, setTasks] = useStored<Task[]>(T, "tasks", TASKS.map(([stage, text]) => ({ id: uid(), stage, text, done: false, note: "" })));
  const [accounts, setAccounts] = useStored<Account[]>(T, "accounts", [
    { id: "a1", name: "Current account", kind: "Bank", ref: "", contact: "Local branch", status: "to notify", needs: "Death certificate, your ID", note: "" },
    { id: "a2", name: "Electricity", kind: "Utility", ref: "", contact: "", status: "to notify", needs: "Meter reading on the date of death", note: "" },
  ]);
  const [docs, setDocs] = useStored<Doc[]>(T, "docs", DOCS);
  const [na, setNa] = useState({ name: "", kind: "Bank" });
  const [openNote, setOpenNote] = useState<string | null>(null);
  const done = tasks.filter(t => t.done).length;
  const settled = accounts.filter(a => a.status === "closed" || a.status === "transferred").length;

  return (
    <div className="stack">
      <section className="panel af-intro">
        <p>There is no right speed for this. Take one thing at a time. Everything you write here stays on this device only.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <label className="field"><span>Name of the person who died</span><input id="af-n" className="input" value={who.name} onChange={e => setWho({ ...who, name: e.target.value })} /></label>
          <label className="field"><span>Date of death</span><input id="af-d" type="date" className="input" value={who.date} onChange={e => setWho({ ...who, date: e.target.value })} /></label>
        </div>
      </section>
      <Section title="Where things stand" aside={<button className="btn small" onClick={() => window.print()}>Print a summary</button>}>
        <Stats><Stat value={`${done} of ${tasks.length}`} label="Steps done" /><Stat value={`${settled} of ${accounts.length}`} label="Accounts settled" /><Stat value={`${docs.filter(d => d.have).length} of ${docs.length}`} label="Documents gathered" /></Stats>
      </Section>

      {STAGES.map(stage => {
        const list = tasks.filter(t => t.stage === stage);
        return (
          <Section key={stage} title={stage} aside={<span className="note">{list.filter(t => t.done).length} of {list.length}</span>}>
            <div className="stack" style={{ gap: 4 }}>
              {list.map(t => (
                <div key={t.id} className="af-task">
                  <label className="check" style={{ flex: 1 }}><input type="checkbox" checked={t.done} onChange={e => setTasks(tasks.map(x => x.id === t.id ? { ...x, done: e.target.checked } : x))} /><span style={{ textDecoration: t.done ? "line-through" : undefined, color: t.done ? "var(--muted)" : undefined }}>{t.text}</span></label>
                  <button className="btn ghost small" onClick={() => setOpenNote(openNote === t.id ? null : t.id)}>{t.note ? "Note" : "Add note"}</button>
                  {openNote === t.id && <textarea className="input" rows={2} style={{ flexBasis: "100%" }} aria-label="Note" value={t.note} onChange={e => setTasks(tasks.map(x => x.id === t.id ? { ...x, note: e.target.value } : x))} placeholder="Who you spoke to, reference numbers, what they need" />}
                </div>
              ))}
              <button className="btn ghost small" style={{ alignSelf: "flex-start" }} onClick={() => setTasks([...tasks, { id: uid(), stage, text: "New step", done: false, note: "" }])}>Add a step</button>
            </div>
          </Section>
        );
      })}

      <Section title="Accounts to notify or close">
        <div className="table-wrap"><table className="t"><thead><tr><th>Account</th><th>Type</th><th>Reference</th><th>Contact</th><th>What they need</th><th>Status</th><th /></tr></thead>
          <tbody>{accounts.map(a => (
            <tr key={a.id}>
              {(["name", "kind", "ref", "contact", "needs"] as const).map(k => <td key={k}>{k === "kind" ? <select className="input" aria-label="Type" value={a.kind} onChange={e => setAccounts(accounts.map(x => x.id === a.id ? { ...x, kind: e.target.value } : x))}>{KINDS.map(o => <option key={o}>{o}</option>)}</select> : <input className="input" aria-label={k} value={a[k]} onChange={e => setAccounts(accounts.map(x => x.id === a.id ? { ...x, [k]: e.target.value } : x))} />}</td>)}
              <td><select className="input" aria-label="Status" value={a.status} onChange={e => setAccounts(accounts.map(x => x.id === a.id ? { ...x, status: e.target.value as Account["status"] } : x))}><option value="to notify">To notify</option><option value="notified">Notified</option><option value="closed">Closed</option><option value="transferred">Transferred</option></select></td>
              <td><button className="btn ghost small danger" onClick={() => setAccounts(accounts.filter(x => x.id !== a.id))}>Delete</button></td>
            </tr>
          ))}</tbody></table></div>
        <form className="row" style={{ marginTop: 12, alignItems: "flex-end" }} onSubmit={e => { e.preventDefault(); if (!na.name.trim()) return; setAccounts([...accounts, { id: uid(), name: na.name.trim(), kind: na.kind, ref: "", contact: "", status: "to notify", needs: "", note: "" }]); setNa({ ...na, name: "" }); }}>
          <label className="field"><span>Account or organisation</span><input id="af-an" className="input" value={na.name} onChange={e => setNa({ ...na, name: e.target.value })} /></label>
          <label className="field"><span>Type</span><select id="af-ak" className="input" value={na.kind} onChange={e => setNa({ ...na, kind: e.target.value })}>{KINDS.map(o => <option key={o}>{o}</option>)}</select></label>
          <button className="btn small" type="submit">Add</button>
        </form>
        <p className="note" style={{ marginTop: 8 }}>Write reference numbers here, never passwords.</p>
      </Section>

      <Section title="Documents">
        <div className="table-wrap"><table className="t"><thead><tr><th>Document</th><th>Have it</th><th className="r">Copies</th><th>Kept where</th><th /></tr></thead>
          <tbody>{docs.map(d => (
            <tr key={d.id}><td><input className="input" aria-label="Document" value={d.name} onChange={e => setDocs(docs.map(x => x.id === d.id ? { ...x, name: e.target.value } : x))} /></td>
              <td><input type="checkbox" aria-label="Have it" checked={d.have} onChange={e => setDocs(docs.map(x => x.id === d.id ? { ...x, have: e.target.checked } : x))} /></td>
              <td><input className="input num" style={{ width: 60 }} aria-label="Copies" value={d.copies} onChange={e => setDocs(docs.map(x => x.id === d.id ? { ...x, copies: parseInt(e.target.value) || 0 } : x))} /></td>
              <td><input className="input" aria-label="Where" value={d.where} onChange={e => setDocs(docs.map(x => x.id === d.id ? { ...x, where: e.target.value } : x))} /></td>
              <td><button className="btn ghost small danger" onClick={() => setDocs(docs.filter(x => x.id !== d.id))}>Delete</button></td></tr>
          ))}</tbody></table></div>
        <button className="btn ghost small" style={{ marginTop: 10 }} onClick={() => setDocs([...docs, { id: uid(), name: "New document", have: false, copies: 0, where: "" }])}>Add a document</button>
      </Section>
      <p className="note">The steps are a general guide. Rules differ by country, so check with a notary or the local civil registry.</p>
      <style>{`.af-intro{border-left:4px solid var(--accent);font-size:17px}.af-task{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 0;border-bottom:1px solid var(--line)}`}</style>
    </div>
  );
}
