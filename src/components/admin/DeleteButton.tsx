"use client";

import { buttonDangerClass } from "./formStyles";

export default function DeleteButton({
  action,
  confirmMessage,
  label = "Delete",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage ?? "Delete this? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className={buttonDangerClass}>
        {label}
      </button>
    </form>
  );
}
