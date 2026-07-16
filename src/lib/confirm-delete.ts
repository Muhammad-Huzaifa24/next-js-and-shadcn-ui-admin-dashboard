import { toast } from "sonner";

/**
 * Shows a confirmation toast. If the user clicks "Delete", `onConfirm` is called.
 *
 * @param label  Human-readable description, e.g. "3 products" or `"Men Grey Hoodie"`
 * @param onConfirm  Callback that performs the actual deletion
 */
export function confirmDelete(label: string, onConfirm: () => void): void {
  toast(`Delete ${label}?`, {
    description: "This action cannot be undone.",
    action: {
      label: "Delete",
      onClick: onConfirm,
    },
    cancel: {
      label: "Cancel",
      onClick: () => {
        // dismiss
      },
    },
  });
}
