"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_TIMES, Entry, Times,
  currentMonth, emptyEntry, monthName, weekdaysOfMonth,
} from "@/lib/attendance";

type Form = {
  studentName: string;
  courseName: string;
  courseDuration: string;
  courseCode: string;
  caseManager: string;
  instructor: string;
  startDate: string;
  endDate: string;
  month: string; // YYYY-MM
  studentSignature?: string;
  staffSignature?: string;
  approverSignature?: string;
  approverName: string;
  comments: string;
  times: Times;
  entries: Record<string, Entry>;
};

const KEY = "bhi-attendance-form-v1";

function blankForm(): Form {
  return {
    studentName: "", courseName: "", courseDuration: "", courseCode: "",
    caseManager: "", instructor: "", startDate: "", endDate: "",
    month: currentMonth(), approverName: "", comments: "",
    times: { ...DEFAULT_TIMES }, entries: {},
  };
}

export default function AttendanceForm() {
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setForm(raw ? { ...blankForm(), ...JSON.parse(raw) } : blankForm());
    } catch {
      setForm(blankForm());
    }
  }, []);

  useEffect(() => {
    if (!form) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(form));
    } catch (e) {
      console.error("Could not save the form", e);
    }
  }, [form]);

  const days = useMemo(() => (form ? weekdaysOfMonth(form.month) : []), [form?.month]);

  if (!form) return <main className="shell"><p className="muted">Loading…</p></main>;

  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const setEntry = (iso: string, patch: Partial<Entry>) =>
    setForm((f) =>
      f ? { ...f, entries: { ...f.entries, [iso]: { ...(f.entries[iso] || emptyEntry()), ...patch } } } : f
    );

  const text = (k: keyof Form, placeholder = "") => (
    <input
      className="cell"
      value={(form[k] as string) || ""}
      placeholder={placeholder}
      onChange={(e) => set({ [k]: e.target.value } as Partial<Form>)}
    />
  );

  const date = (k: "startDate" | "endDate") => (
    <input className="cell" type="date" value={form[k]} onChange={(e) => set({ [k]: e.target.value })} />
  );

  return (
    <main className="shell">
      <div className="toolbar no-print">
        <div className="toolbar-group">
          <SignatureUpload
            label="Student signature"
            value={form.studentSignature}
            onChange={(v) => set({ studentSignature: v })}
          />
          <SignatureUpload
            label="Staff signature"
            value={form.staffSignature}
            onChange={(v) => set({ staffSignature: v })}
          />
        </div>
        <div className="toolbar-group">
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm("Clear this sheet and start a new one? The student signature is kept.")) {
                setForm({ ...blankForm(), studentSignature: form.studentSignature, staffSignature: form.staffSignature });
              }
            }}
          >
            New sheet
          </button>
          <button className="btn primary" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
      </div>

      <article className="paper">
        <div className="paper-head">
          <h2>Individual student attendance sheet</h2>
          <img src="/bhi-logo.jpeg" alt="Bright Horizon Institute" />
        </div>

        <table className="info">
          <tbody>
            <tr><th>Student name:</th><td>{text("studentName")}</td><th>Course name:</th><td>{text("courseName")}</td></tr>
            <tr><th>Course duration:</th><td>{text("courseDuration")}</td><th>Course code:</th><td>{text("courseCode")}</td></tr>
            <tr><th>Case manager:</th><td>{text("caseManager")}</td><th>Start date:</th><td>{date("startDate")}</td></tr>
            <tr><th>Instructor:</th><td>{text("instructor")}</td><th>End date:</th><td>{date("endDate")}</td></tr>
          </tbody>
        </table>

        <p className="month-line">
          Month:{" "}
          <label className="month-pick">
            <u>{monthName(form.month)}</u>
            <input
              type="month"
              className="no-print"
              value={form.month}
              onChange={(e) => e.target.value && set({ month: e.target.value })}
              aria-label="Choose month"
            />
          </label>{" "}
          Year: <u>{form.month.slice(0, 4)}</u>
        </p>

        <div className="table-scroll">
          <table className="grid">
            <thead>
              <tr>
                <th></th><th>Date</th><th>Start time</th><th>Lunch time out</th><th>Lunch time in</th>
                <th>End time</th><th>Student signature</th><th>Staff signature</th>
                <th className="no-print">Holiday</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const e = form.entries[d.iso] || emptyEntry();
                const field = (k: keyof Times) => (
                  <td>
                    <input
                      className="cell"
                      value={e[k]}
                      onChange={(ev) => setEntry(d.iso, { [k]: ev.target.value })}
                      aria-label={`${k} on ${d.label}`}
                    />
                  </td>
                );
                return (
                  <tr key={d.iso}>
                    <td className="dow">{d.dayName}</td>
                    <td className="date">{d.label}</td>
                    {e.holiday ? (
                      <td colSpan={4} className="holiday-cell">Holiday</td>
                    ) : (
                      <>{field("start")}{field("lunchOut")}{field("lunchIn")}{field("end")}</>
                    )}
                    <td className="sig">
                      {e.studentSigned && form.studentSignature ? (
                        <button
                          className="sig-btn"
                          title="Tap to remove"
                          onClick={() =>
                            setEntry(d.iso, { studentSigned: false, start: "", lunchOut: "", lunchIn: "", end: "" })
                          }
                        >
                          <img src={form.studentSignature} alt="Student signature" />
                        </button>
                      ) : (
                        !e.holiday && (
                          <button
                            className="bubble no-print"
                            aria-label={`Student sign ${d.label}`}
                            onClick={() => {
                              if (!form.studentSignature) return alert("Upload the student signature first.");
                              setEntry(d.iso, { ...form.times, studentSigned: true });
                            }}
                          />
                        )
                      )}
                    </td>
                    <td className="sig">
                      {e.staffSigned && form.staffSignature ? (
                        <button className="sig-btn" title="Tap to remove" onClick={() => setEntry(d.iso, { staffSigned: false })}>
                          <img src={form.staffSignature} alt="Staff signature" />
                        </button>
                      ) : (
                        !e.holiday && (
                          <button
                            className="bubble no-print"
                            aria-label={`Staff sign ${d.label}`}
                            onClick={() => {
                              if (!form.staffSignature) return alert("Upload the staff signature first.");
                              setEntry(d.iso, { staffSigned: true });
                            }}
                          />
                        )
                      )}
                    </td>
                    <td className="no-print center">
                      <input
                        type="checkbox"
                        checked={e.holiday}
                        onChange={(ev) => setEntry(d.iso, { holiday: ev.target.checked })}
                        aria-label={`Mark ${d.label} as holiday`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="approval">
          <p><u><strong>Approved by:</strong></u></p>
          <label className="approval-row">
            <strong>Staff name/position:</strong>
            <input value={form.approverName} onChange={(e) => set({ approverName: e.target.value })} />
          </label>
          <div className="approval-row">
            <strong>Staff signature:</strong>
            {form.approverSignature ? (
              <button className="sig-btn approver" title="Tap to remove" onClick={() => set({ approverSignature: undefined })}>
                <img src={form.approverSignature} alt="Approver signature" />
              </button>
            ) : (
              <span className="no-print">
                <SignatureUpload label="Upload" value={undefined} onChange={(v) => set({ approverSignature: v })} compact />
              </span>
            )}
          </div>
          <label className="approval-row comments">
            <strong>Comments:</strong>
            <textarea rows={3} value={form.comments} onChange={(e) => set({ comments: e.target.value })} />
          </label>
        </div>
      </article>

      <details className="times-settings no-print">
        <summary>Times filled in when a student signs</summary>
        <div className="form-grid four">
          {([
            ["start", "Start time"], ["lunchOut", "Lunch time out"], ["lunchIn", "Lunch time in"], ["end", "End time"],
          ] as [keyof Times, string][]).map(([k, label]) => (
            <label key={k}>
              {label}
              <input value={form.times[k]} onChange={(e) => set({ times: { ...form.times, [k]: e.target.value } })} />
            </label>
          ))}
        </div>
      </details>
    </main>
  );
}

/* Upload a photo/scan of a handwritten signature. The white paper background is made transparent. */
function SignatureUpload(props: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      props.onChange(await cleanSignature(file));
    } catch {
      alert("That file couldn't be read. Upload a JPG or PNG image of the signature.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={props.compact ? "upload compact" : "upload"}>
      {!props.compact && <span className="upload-label">{props.label}</span>}
      {props.value && <img src={props.value} alt={props.label} className="upload-preview" />}
      <button className="btn ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? "Processing…" : props.value ? "Replace" : props.compact ? "Upload signature" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}

function cleanSignature(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 600 / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      const px = data.data;
      let top = h, left = w, right = 0, bottom = 0;
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        if (lum > 170) {
          px[i + 3] = 0; // paper → transparent
        } else {
          const p = i / 4, x = p % w, y = Math.floor(p / w);
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
      ctx.putImageData(data, 0, 0);
      URL.revokeObjectURL(url);
      if (right < left) return resolve(c.toDataURL("image/png"));
      const out = document.createElement("canvas");
      out.width = right - left + 1;
      out.height = bottom - top + 1;
      out.getContext("2d")!.drawImage(c, left, top, out.width, out.height, 0, 0, out.width, out.height);
      resolve(out.toDataURL("image/png"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}
