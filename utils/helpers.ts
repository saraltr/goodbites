export function formatDate(dateInput: Date | string | null | undefined): string {

    if (!dateInput) return "Unknown date";

    let date: Date;

    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
    } else {
        return "Unknown date";
    }

    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}