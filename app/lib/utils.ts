/**
 * Checks if a value is valid for display.
 * Returns false if the value is null, undefined, empty string, or "***" (masked).
 */
export const isValidDisplayValue = (value?: string | null): boolean => {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed !== "" && trimmed !== "***";
};
