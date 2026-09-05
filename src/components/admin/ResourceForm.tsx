import Link from "next/link";
import type { SimpleResourceConfig } from "@/lib/admin/simple-resources";
import type { RelationOption } from "@/lib/admin/relation-options";
import SlugField from "./SlugField";
import ImageUploadField from "./ImageUploadField";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  jsonClass,
  labelClass,
  selectClass,
  textareaClass,
} from "./formStyles";

export default function ResourceForm({
  config,
  action,
  record,
  relationOptions,
}: {
  config: SimpleResourceConfig;
  action: (formData: FormData) => void | Promise<void>;
  record?: Record<string, unknown>;
  relationOptions: Record<string, RelationOption[]>;
}) {
  return (
    <form
      action={action}
      className="flex max-w-2xl flex-col gap-5 rounded-lg border border-black/10 bg-white p-6"
    >
      {config.fields.map((field) => {
        const rawValue = record?.[field.name];
        const stringValue =
          rawValue === null || rawValue === undefined ? "" : String(rawValue);

        return (
          <label key={field.name} className="flex flex-col gap-1.5">
            <span className={labelClass}>
              {field.label}
              {field.required ? " *" : ""}
            </span>

            {field.type === "text" && (
              <input
                name={field.name}
                defaultValue={stringValue}
                required={field.required}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}

            {field.type === "number" && (
              <input
                type="number"
                step="any"
                name={field.name}
                defaultValue={stringValue}
                required={field.required}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}

            {field.type === "textarea" && (
              <textarea
                name={field.name}
                defaultValue={stringValue}
                required={field.required}
                placeholder={field.placeholder}
                className={textareaClass}
              />
            )}

            {field.type === "json" && (
              <textarea
                name={field.name}
                defaultValue={
                  rawValue !== undefined && rawValue !== null
                    ? JSON.stringify(rawValue, null, 2)
                    : ""
                }
                required={field.required}
                className={jsonClass}
                spellCheck={false}
              />
            )}

            {field.type === "slug" && (
              <SlugField
                name={field.name}
                slugFrom={field.slugFrom ?? "title"}
                defaultValue={stringValue}
                required={field.required}
              />
            )}

            {field.type === "image" && (
              <ImageUploadField name={field.name} defaultValue={stringValue} />
            )}

            {field.type === "select" && field.options && (
              <select
                name={field.name}
                defaultValue={stringValue}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "select" && field.relation && (
              <select
                name={field.name}
                defaultValue={stringValue}
                required={field.required}
                className={selectClass}
              >
                <option value="">None</option>
                {(relationOptions[field.name] ?? []).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.helpText && (
              <span className="text-xs text-black/40">{field.helpText}</span>
            )}
          </label>
        );
      })}

      <div className="flex gap-3">
        <button type="submit" className={buttonPrimaryClass}>
          Save
        </button>
        <Link href={`/admin/${config.key}`} className={buttonSecondaryClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
