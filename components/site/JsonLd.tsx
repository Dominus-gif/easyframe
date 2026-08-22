/** Renders a JSON-LD structured-data block. Server component. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; no user input is included here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
