import type { Period } from "../api";
import { hours } from "../api";
import { messages as m } from "../constants/messages";
import { Button, Card } from "../components/ui";

export const ReviewView = ({ period, onSelect }: { period: Period; onSelect: (date: string) => void }) => <div className="stack"><div className="section-heading"><div><p className="eyebrow">{m.periodReview}</p><h2>{m.review}</h2></div></div><Card><div className="table-wrap"><table><thead><tr><th>{m.date}</th><th>{m.dayType}</th><th>{m.regularHours}</th><th>{m.overtimeHours}</th><th>{m.nightOtHours}</th><th>{m.restDayHours}</th><th /></tr></thead><tbody>{period.dailyRecords.length === 0 ? <tr><td colSpan={7}>{m.noRecords}</td></tr> : period.dailyRecords.map((record) => <tr key={record.id}><td>{record.workDate}</td><td>{record.dayType}</td><td>{hours(record.regularMinutes)}</td><td>{hours(record.regularOtMinutes)}</td><td>{hours(record.nightDiffOtMinutes)}</td><td>{hours(record.restDayMinutes + record.restDayOtMinutes)}</td><td><Button secondary onClick={() => onSelect(record.workDate)}>{m.dailyEntry}</Button></td></tr>)}</tbody></table></div></Card></div>;
