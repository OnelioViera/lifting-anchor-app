"use client";

import { useEffect, useRef, useState } from "react";
import { inputClass } from "./formStyles";
import { slugify } from "@/lib/slugify";

/**
 * A slug text field that auto-fills from another field on the same form
 * (by DOM `name`) until the user types into it directly — after that, it
 * stops overwriting their edits.
 */
export default function SlugField({
  name,
  slugFrom,
  defaultValue,
  required,
}: {
  name: string;
  slugFrom: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const editedRef = useRef(Boolean(defaultValue));

  useEffect(() => {
    const source = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${slugFrom}"]`
    );
    if (!source) return;

    const handler = () => {
      if (!editedRef.current) setValue(slugify(source.value));
    };
    source.addEventListener("input", handler);
    return () => source.removeEventListener("input", handler);
  }, [slugFrom]);

  return (
    <input
      name={name}
      required={required}
      value={value}
      onChange={(e) => {
        editedRef.current = true;
        setValue(e.target.value);
      }}
      placeholder="auto-generated-from-title"
      className={inputClass}
    />
  );
}
