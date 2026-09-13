"use client";

import { useEffect, useState } from "react";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from "react-simple-captcha";

export default function CaptchaChallenge({ onValidChange }: { onValidChange: (isValid: boolean) => void }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    loadCaptchaEnginge(6, "#f8f9fc", "#111b40", "upper");
    onValidChange(false);
  }, [onValidChange]);

  const updateValue = (nextValue: string) => {
    const next = nextValue.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
    setValue(next);
    onValidChange(next.length === 6 && validateCaptcha(next, false));
  };

  return (
    <div className="mt-5">
      <div className="rounded-xl border border-border-control bg-surface-control p-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-soft">Security check</span>
          <span className="text-[10px] text-muted-soft">6 characters</span>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border-control bg-white px-3 py-2 text-center shadow-sm [&_a]:mt-2 [&_a]:inline-flex [&_a]:items-center [&_a]:rounded-md [&_a]:border [&_a]:border-orange-200 [&_a]:bg-orange-50 [&_a]:px-3 [&_a]:py-1.5 [&_a]:text-[11px] [&_a]:font-semibold [&_a]:text-primary [&_a]:no-underline [&_a]:transition [&_a]:hover:bg-orange-100 [&_canvas]:mx-auto [&_canvas]:block [&_canvas]:h-10 [&_canvas]:w-full [&_canvas]:max-w-[240px]">
          <LoadCanvasTemplate reloadText="Refresh CAPTCHA" reloadColor="#f97316" />
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-soft">Enter the letters and numbers shown above.</p>
      </div>
      <label className="mt-4 block text-xs font-semibold text-ink">
        CAPTCHA text
        <input
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          placeholder="Enter CAPTCHA text"
          autoFocus
          aria-label="CAPTCHA text"
          className="mt-2 h-11 w-full rounded-lg border border-border-control bg-white px-3 text-center text-sm font-medium tracking-normal text-ink outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-orange-100"
        />
      </label>
    </div>
  );
}
