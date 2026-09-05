"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonSecondaryClass, inputClass } from "./formStyles";

/**
 * A text input holding a public image/file URL, plus an "Upload" button
 * that pushes a chosen file straight to the Supabase Storage "catalog"
 * bucket (see supabase/schema.sql) and fills the URL in automatically.
 * You can also just paste a URL directly if the asset already lives
 * somewhere else.
 *
 * Two modes:
 *  - Uncontrolled (pass `name`): renders a plain named input so it
 *    submits with a surrounding <form action={...}> via FormData. Used by
 *    the generic simple-resource admin forms.
 *  - Controlled (pass `value` + `onChange`): the parent owns the string.
 *    Used by richer client-managed forms like the Lifting Anchor editor.
 */
export default function ImageUploadField({
  name,
  defaultValue,
  value,
  onChange,
}: {
  name?: string;
  defaultValue?: string | null;
  value?: string | null;
  onChange?: (url: string) => void;
}) {
  const isControlled = value !== undefined;
  const [internalUrl, setInternalUrl] = useState(defaultValue ?? "");
  const url = isControlled ? value ?? "" : internalUrl;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setUrl(next: string) {
    if (isControlled) onChange?.(next);
    else setInternalUrl(next);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
      const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

      const { error: uploadError } = await supabase.storage
        .from("catalog")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("catalog").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. You can also paste a URL directly."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://… (or upload below)"
        className={inputClass}
      />
      <div className="flex items-center gap-3">
        <label className={`${buttonSecondaryClass} cursor-pointer`}>
          {uploading ? "Uploading…" : "Upload file"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {url && (
          // Preview only — arbitrary uploaded/pasted URLs aren't worth
          // routing through next/image's optimizer here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-12 w-12 rounded border border-black/10 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        )}
      </div>
      {error && <p className="text-xs text-lp-red">{error}</p>}
    </div>
  );
}
