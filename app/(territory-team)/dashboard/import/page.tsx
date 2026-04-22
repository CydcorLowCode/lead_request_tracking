import { redirect } from "next/navigation";

/** Legacy URL — new flow lives under `/imports/new`. */
export default function AttImportPageRedirect() {
  redirect("/imports/new");
}
