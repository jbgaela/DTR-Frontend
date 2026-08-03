import type { ButtonHTMLAttributes, ReactNode } from "react";

export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="field"><span>{label}</span>{children}</label>;

export const Button = ({ children, secondary = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) => <button className={secondary ? "button secondary" : "button"} {...props}>{children}</button>;

export const Card = ({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) => <section className="card">{title && <div className="card-header"><h2>{title}</h2>{action}</div>}{children}</section>;
