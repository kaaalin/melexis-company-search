"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Building2, Users2, Download, Loader2, Filter, ExternalLink, Mail, Phone, Globe, MapPin, ChevronDown, ChevronUp, Copy, Bug, Link as LinkIcon } from "lucide-react";

// Lightweight UI primitives (Tailwind-based)
const Chip = ({ children }: {children: React.ReactNode}) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700 gap-1">
    {children}
  </span>
);
const Label = ({ children }: {children: React.ReactNode}) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className||""}`} />
);

const Button = ({ children, icon:Icon, variant = "primary", className = "", ...props } : any) => {
  const base = "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition shadow-sm";
  const variants: Record<string,string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-white text-gray-800 border hover:bg-gray-50",
    subtle: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  };
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};
const Card = ({ children, className = "" }: {children: React.ReactNode, className?: string}) => (
  <div className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}>{children}</div>
);
const SectionTitle = ({ icon: Icon, title, subtitle }:{icon:any, title:string, subtitle?:string}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><Icon size={18} /></div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// --- Mock AI layer ---------------------------------------------------------
type Source = { title: string; url: string };
type Company = {
  name: string;
  website: string;
  hq: string;
  tags: string[];
  why: string;
  applicationsSummary: string;
  sources: Source[];
  outreach: string;
  score: number;
};

function mockFindCompanies(query: Record<string, string>): Promise<Company[]> {
  const { product, applications, regions, industries } = query;
  const seed = (product + applications + regions + industries).length;
  const companies: Omit<Company, "score">[] = [
    {
      name: "BYD",
      website: "https://www.byd.com",
      hq: "Shenzhen, China",
      tags: ["EV OEM", "E/E architecture", "By-wire"],
      why: `${product} fits steering/actuator angle sensing in ${applications}. BYD's platform breadth creates many sensor sockets.`,
      applicationsSummary: "Steer-by-wire angle sensing, pedal position, electric pump/valve position feedback, gear/drive selector angle.",
      sources: [
        { title: "BYD Official Site", url: "https://www.byd.com" },
        { title: "Platform overview (public materials)", url: "https://www.byd.com/en/ev" }
      ],
      outreach: "Start with chassis electronics and sourcing. Reference Triaxis stray-field robustness + ASIL options. Offer eval boards and AEC-Q100 reports; propose 30-min tech deep dive.",
    },
    {
      name: "NIO",
      website: "https://www.nio.com",
      hq: "Shanghai, China",
      tags: ["Premium EV", "Steer-by-wire", "Domain control"],
      why: `Active steer-by-wire programs demand redundant rotary sensors; ${product} (stray-field robust) is a match.`,
      applicationsSummary: "Redundant steering angle sensors, brake-by-wire travel sensing, shift-by-wire selectors, actuator feedback sensors.",
      sources: [
        { title: "NIO Newsroom", url: "https://www.nio.com/news" },
        { title: "Product pages", url: "https://www.nio.com" }
      ],
      outreach: "Target SBW program leaders and EE sourcing. Lead with safety integrity, latency and temp drift data; include reference designs for column/rack sensors.",
    },
    {
      name: "XPeng",
      website: "https://www.xpeng.com",
      hq: "Guangzhou, China",
      tags: ["EV OEM", "X-EEA", "Smart chassis"],
      why: `Centralized chassis increases actuator count. ${product} applicable to pedals, pumps, valves, selectors.`,
      applicationsSummary: "Pedal/selector angle, active suspension position, thermal system valve/pump position, drive mode knob.",
      sources: [
        { title: "XPeng Site", url: "https://www.xpeng.com" },
        { title: "Press Releases", url: "https://en.xiaopeng.com/news" }
      ],
      outreach: "Connect with chassis control and procurement; propose pilot on 2–3 actuators with quick DVP&R outline and PPAP plan.",
    },
    {
      name: "Geely / Zeekr",
      website: "https://www.zeekr.com",
      hq: "Hangzhou, China",
      tags: ["SEA Platform", "SBW roadmap"],
      why: `SEA-M targets tight-turn and autonomy; needs high-integrity position feedback where ${product} excels.`,
      applicationsSummary: "SBW angle sensing, brake-by-wire pedal/pressure position, steering column redundancy, e-pump/valve feedback.",
      sources: [
        { title: "Zeekr Site", url: "https://www.zeekr.com" },
        { title: "Geely Platform Materials", url: "https://global.geely.com" }
      ],
      outreach: "Approach intelligent chassis VP and platform engineering. Offer sensor placement guide, magnet selection app note, and EMC/stray-field demos.",
    },
    {
      name: "Inovance Automotive",
      website: "https://www.inovance.com",
      hq: "Suzhou, China",
      tags: ["Tier-1", "Drives & Motion", "Actuators"],
      why: `Supplies e-pumps/actuators. ${product} can provide angle/linear feedback for compact actuators.`,
      applicationsSummary: "Motorized valve position sensing, e-pump rotor/shaft angle, linear actuator stroke sensing.",
      sources: [
        { title: "Inovance Automotive", url: "https://www.inovance.com" }
      ],
      outreach: "Pitch line-fit sensor modules co-developed for actuators; propose sample build with SPI/I2C interface and calibration profile.",
    },
  ];
  const out = companies
    .map((c, i) => ({ ...c, score: ((i + 1) * 13 * seed) % 100 }))
    .sort((a, b) => b.score - a.score);
  return new Promise((res) => setTimeout(() => res(out), 500));
}

type Person = { name: string; role: string; email?: string; phone?: string };

function mockFindDecisionMakers(company: string): Promise<Person[]> {
  const roster: Record<string, Person[]> = {
    BYD: [
      { name: "Yan Li", role: "VP, Chassis Electronics", email: "yan.li@byd.com", phone: "+86 755 0000 0001" },
      { name: "Q. Zhang", role: "Director, Sensors & Mechatronics", email: "q.zhang@byd.com" },
    ],
    NIO: [
      { name: "Y. Chen", role: "Head of Steer-by-Wire Program", email: "y.chen@nio.com" },
      { name: "M. Liu", role: "Director, Supplier Sourcing (EE)", email: "m.liu@nio.com" },
    ],
    XPeng: [
      { name: "J. Wu", role: "Director, Chassis Control", email: "jian.wu@xpeng.com" },
    ],
    "Geely / Zeekr": [
      { name: "R. Sun", role: "VP, Intelligent Chassis", email: "rui.sun@zeekr.com" },
    ],
    "Inovance Automotive": [
      { name: "T. He", role: "GM, Automotive Drives", email: "t.he@inovance.com" },
    ],
  };
  return new Promise((res) => setTimeout(() => res(roster[company] || []), 450));
}

// Utility: copy to clipboard
async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

// CSV export
function exportCSV(companies: Company[]) {
  const rows = [
    ["Company", "Why", "Applications", "Outreach", "HQ", "Website", "Tags", "Sources"],
    ...companies.map((c) => [
      c.name,
      c.why,
      c.applicationsSummary,
      c.outreach,
      c.hq,
      c.website,
      c.tags.join("|"),
      (c.sources||[]).map(s=>`${s.title}:${s.url}`).join("|")
    ])
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "ai-sales-scout-results.csv"; a.click();
  URL.revokeObjectURL(url);
}

// --- Components ------------------------------------------------------------
function CompanyCard({ company }: {company: Company}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);

  const handleDM = async () => {
    setLoading(true);
    const res = await mockFindDecisionMakers(company.name);
    setPeople(res);
    setLoading(false);
    setOpen(true);
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-600" size={18} />
            <h4 className="text-base font-semibold">{company.name}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {company.tags.map((t) => (<Chip key={t}>{t}</Chip>))}
          </div>
        </div>
        <a className="text-indigo-600 text-sm inline-flex items-center gap-1 hover:underline" href={company.website} target="_blank" rel="noreferrer">
          Visit <ExternalLink size={14} />
        </a>
      </div>

      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-gray-500">Potential applications</div>
        <p className="text-sm text-gray-800 leading-relaxed">{company.applicationsSummary}</p>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{company.why}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1"><MapPin size={14}/> {company.hq}</span>
        <span className="inline-flex items-center gap-1"><Globe size={14}/> {new URL(company.website).hostname}</span>
      </div>

      <div className="mt-2">
        <div className="text-xs uppercase tracking-wide text-gray-500">Sources</div>
        {(company.sources||[]).length === 0 && (
          <div className="text-sm text-gray-600">No sources provided.</div>
        )}
        <ul className="mt-1 space-y-1">
          {(company.sources||[]).map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <LinkIcon size={14} className="text-indigo-600" />
              <a className="text-indigo-700 hover:underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2">
        <div className="text-xs uppercase tracking-wide text-gray-500">Suggested outreach</div>
        <p className="text-sm text-gray-800 leading-relaxed">{company.outreach}</p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button onClick={handleDM} icon={Users2} variant="subtle">
          Identify decision makers
        </Button>
        {open && (
          <Button variant="ghost" className="text-indigo-700" onClick={() => setOpen(!open)} icon={open ? ChevronUp : ChevronDown}>
            {open ? "Hide" : "Show"} contacts
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="animate-spin" size={16}/> Fetching contacts…</div>
      )}

      {open && people.length > 0 && (
        <div className="mt-2 space-y-2">
          {people.map((p, i) => (
            <div key={i} className="rounded-xl border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.role}</div>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  {p.email && (
                    <a className="inline-flex items-center gap-1 text-indigo-600 hover:underline" href={`mailto:${p.email}`}><Mail size={14}/> {p.email}</a>
                  )}
                  {p.phone && (
                    <a className="inline-flex items-center gap-1 text-indigo-600 hover:underline" href={`tel:${p.phone}`}><Phone size={14}/> {p.phone}</a>
                  )}
                </div>
              </div>
              {p.email && (
                <Button variant="ghost" icon={Copy} onClick={async()=>{const ok=await copyText(`${p.name} — ${p.role} — ${p.email}`); if(ok){alert("Copied to clipboard");}}}>Copy</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RunLog({ logs }:{logs:{title:string, detail:string}[]}) {
  return (
    <Card className="space-y-2">
      <SectionTitle icon={Sparkles} title="Agent run log" subtitle="Trace of reasoning & sources (mock)" />
      <div className="text-xs text-gray-600 space-y-1 max-h-56 overflow-auto">
        {logs.map((l, i) => (
          <div key={i} className="border-l-2 pl-3 py-1">
            <div className="font-medium">{l.title}</div>
            <div className="opacity-90">{l.detail}</div>
          </div>
        ))}
        {logs.length === 0 && <div className="text-gray-500">No logs yet.</div>}
      </div>
    </Card>
  );
}

// Simple dev tests
async function runTests(): Promise<{name:string; pass:boolean; note?:string}[]> {
  const results: {name:string; pass:boolean; note?:string}[] = [];
  try {
    const list = [
      "mockFindCompanies returns Promise",
      "company objects have required fields",
      "exportCSV handles empty input",
      "company objects include new fields",
    ];

    const p = mockFindCompanies({ product: "Test", applications: "A", regions: "R", industries: "I" });
    results.push({ name: list[0], pass: p instanceof Promise });

    const arr = await p;
    const baseOk = Array.isArray(arr) && arr.length > 0 && ["name","website","hq","tags","why","score"].every(k => k in arr[0]);
    const newOk = ["applicationsSummary","sources","outreach"].every(k => k in arr[0]);
    results.push({ name: list[1], pass: baseOk });
    results.push({ name: list[3], pass: newOk });

    let threw = false;
    try { exportCSV([] as any); } catch { threw = true; }
    results.push({ name: list[2], pass: !threw });

    return results;
  } catch (e:any) {
    results.push({ name: "unexpected error in tests", pass: false, note: String(e) });
    return results;
  }
}

function TestPanel() {
  const [running, setRunning] = useState(false);
  const [res, setRes] = useState<{name:string;pass:boolean;note?:string}[]>([]);
  const onRun = async () => {
    setRunning(true);
    const out = await runTests();
    setRes(out);
    setRunning(false);
  };
  const passed = res.filter(r=>r.pass).length;
  return (
    <Card>
      <SectionTitle icon={Bug} title="Dev tests" subtitle="Basic sanity checks" />
      <div className="text-sm text-gray-700">
        <Button onClick={onRun} disabled={running} className="mb-3" variant="subtle">{running? "Running…" : "Run tests"}</Button>
        {res.length>0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600">{passed}/{res.length} passed</div>
            <ul className="list-disc pl-5 space-y-1">
              {res.map((r,i)=> (
                <li key={i} className={r.pass? "text-green-700" : "text-red-700"}>
                  {r.name} {r.pass? "✓" : "✗"} {r.note? `— ${r.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function SalesScoutApp() {
  const [product, setProduct] = useState("Melexis Triaxis (3D magnetic position)");
  const [applications, setApplications] = useState("steer-by-wire, brake-by-wire, pedals, pumps, valves, selectors");
  const [regions, setRegions] = useState("China, EU, US");
  const [industries, setIndustries] = useState("Automotive, Industrial Automation, Robotics");
  const [keywords, setKeywords] = useState("stray-field robust, ASIL, rotary, linear, angle");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Company[]>([]);
  const [logs, setLogs] = useState<{title:string;detail:string}[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    setLogs((x) => ([
      ...x,
      { title: "Seed search", detail: `Searching for companies in ${regions} within ${industries} for ${applications}.` },
      { title: "Filter", detail: `Applying product fit heuristics: ${product} with keywords: ${keywords}.` },
    ]));
    const res = await mockFindCompanies({ product, applications, regions, industries, keywords });
    setResults(res);
    setLogs((x)=> ([...x, { title: "Rank", detail: `Ranked ${res.length} candidates by platform fit, actuator density, program visibility.` }]));
    setLoading(false);
  };

  const scoreTop = useMemo(()=> results[0]?.score ?? 100, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-indigo-600 p-2 text-white">
              <Sparkles size={18} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">AI Sales Scout</h1>
              <p className="text-sm text-gray-600">Find likely adopters of Melexis parts and the people to contact</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" icon={Download} onClick={()=>exportCSV(results)} disabled={results.length===0}>Export CSV</Button>
            <a href="#how-it-works" className="text-sm text-indigo-700 hover:underline">How it works</a>
          </div>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Product</Label>
              <Input value={product} onChange={(e)=>setProduct(e.target.value)} placeholder="e.g., MLX90395, MLX9042x…" />
            </div>
            <div>
              <Label>Target applications</Label>
              <Input value={applications} onChange={(e)=>setApplications(e.target.value)} placeholder="e.g., steer-by-wire, pedals…" />
            </div>
            <div>
              <Label>Regions</Label>
              <Input value={regions} onChange={(e)=>setRegions(e.target.value)} placeholder="e.g., China" />
            </div>
            <div>
              <Label>Industries</Label>
              <Input value={industries} onChange={(e)=>setIndustries(e.target.value)} placeholder="e.g., Automotive" />
            </div>
            <div className="lg:col-span-2">
              <Label>Search hints / keywords</Label>
              <Input value={keywords} onChange={(e)=>setKeywords(e.target.value)} placeholder="e.g., ASIL, stray-field, rotary, linear" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button icon={Search} onClick={handleSearch} disabled={loading}>{loading ? "Searching…" : "Find companies"}</Button>
            <Chip><Filter size={12}/> Heuristics: platform fit • actuator density • safety level</Chip>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SectionTitle icon={Building2} title="Company candidates" subtitle={results.length? `${results.length} matches • click a card to fetch decision makers` : "Results will appear here"} />
            {results.length === 0 && (
              <Card>
                <div className="text-sm text-gray-600">No results yet. Set your inputs and click <b>Find companies</b>.</div>
              </Card>
            )}
            {results.map((c) => (
              <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <CompanyCard company={c} />
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <RunLog logs={logs} />
            {results.length>0 && (
              <Card>
                <SectionTitle icon={Users2} title="Fit snapshot" subtitle="Relative score (mock)" />
                <div className="mt-3 space-y-2">
                  {results.map(r => (
                    <div key={r.name} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{r.name}</span>
                        <span className="text-gray-500">{r.score}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-2 bg-indigo-600" style={{ width: `${Math.max(6, (r.score/Math.max(1, scoreTop))*100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <TestPanel />
          </div>
        </div>

        <div id="how-it-works" className="mt-10">
          <Card>
            <h3 className="text-base font-semibold mb-2">How to plug in a real AI agent</h3>
            <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
              <li>
                Replace <code>mockFindCompanies</code> with a backend endpoint that orchestrates: web search (newsrooms, OEM sites, specs), vector DB of past wins, and an LLM ranker. Return <code>[&#123;&#123; name, website, hq, tags[], why, score, applicationsSummary, sources[], outreach &#125;&#125;]</code>.
              </li>
              <li>
                Replace <code>mockFindDecisionMakers</code> with an enrichment pipeline: LinkedIn/Crunchbase APIs, Clearbit/People Data, conference speakers, and company org-charts. Return <code>[&#123;&#123; name, role, email?, phone? &#125;&#125;]</code>.
              </li>
              <li>
                Add source attributions into <b>Agent run log</b> for compliance and sales notes.
              </li>
              <li>
                Extend schema with <i>program timing</i> (SOP, RFQ, platform), <i>ASIL target</i>, and <i>procurement status</i> to prioritize outreach.
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
