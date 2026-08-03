import { messages as m } from "../constants/messages";
import { Card } from "../components/ui";

export const ExportsView = ({ periodId }: { periodId: string }) => <div className="stack"><div className="section-heading"><div><p className="eyebrow">{m.exports}</p><h2>{m.exports}</h2></div></div><Card><p className="muted">{m.exportHint}</p><div className="export-grid"><a className="export-card" href={`/api/periods/${periodId}/export/dtr`}><strong>{m.dtrExport}</strong><span>{m.xlsx}</span></a><a className="export-card" href={`/api/periods/${periodId}/export/accomplishments`}><strong>{m.taskExport}</strong><span>{m.xlsx}</span></a></div></Card></div>;
