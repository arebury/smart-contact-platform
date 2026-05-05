/**
 * Shared clipboard utility — replaces deprecated document.execCommand('copy')
 * with modern Clipboard API + textarea fallback for restricted environments.
 * DD#146: extracted from DeleteAgentDialog + DeleteDialog duplicated code.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Modern approach first
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API blocked — fall through to fallback
    }
  }

  // Fallback: hidden textarea + execCommand
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}
