import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {
  // If links is a raw HTML string, attempt to extract readable labels and avoid printing raw URLs
  if (typeof links === "string") {
    // Strip any http:// or https:// URLs from the raw HTML to avoid printing concatenated URLs
    const stripped = links.replace(/https?:\/\/[^\s"'<]+/g, "");
    return (
      <nav className="text-center mt-4">
        <div dangerouslySetInnerHTML={{ __html: stripped }} />
      </nav>
    );
  }

  const items = Array.isArray(links) ? links : Object.values(links || {});
  const filtered = (items || []).filter(Boolean);

  return (
    <nav className="text-center mt-4">
      {filtered.map((link, idx) => {
        if (typeof link === "string") {
          const stripped = link.replace(/https?:\/\/[^\s"'<]+/g, "");
          return (
            <span
              key={idx}
              className="inline-block py-2 px-3 rounded-lg text-gray-200 text-xs"
              dangerouslySetInnerHTML={{ __html: stripped }}
            />
          );
        }

        const url = link?.url || null;
        const label = link?.label ?? String(idx);
        const active = !!link?.active;

        if (!url) {
          return (
            <span
              key={idx}
              className={
                "inline-block py-2 px-3 rounded-lg text-xs " +
                (active ? "bg-gray-950 text-white" : "text-gray-500 cursor-not-allowed")
              }
              dangerouslySetInnerHTML={{ __html: label }}
            />
          );
        }

        return (
          <Link
            preserveScroll
            href={url}
            key={idx}
            className={
              "inline-block py-2 px-3 rounded-lg text-gray-200 text-xs " +
              (active ? "bg-gray-800 text-white" : " bg-white text-gray-700 border") +
              " hover:shadow"
            }
            // sanitize label by removing full urls
            dangerouslySetInnerHTML={{ __html: String(label).replace(/https?:\/\/[^\s"'<]+/g, "") }}
          />
        );
      })}
    </nav>
  );
}
