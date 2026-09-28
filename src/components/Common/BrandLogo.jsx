// Edusaz logo: the cropped graduation-cap mark plus a live-text wordmark.
// The original exports (edusaz.svg / edusaz-yan.png) carry huge empty margins, which made the
// logo look tiny wherever it was used; this component renders the mark edge to edge.
// Styling is inline so it works both on the SCSS public site and in the Tailwind panels.

export default function BrandLogo({ size = 32, tone = 'ink', wordmark = true, className = '', label = 'Edusaz' }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.3), lineHeight: 1 }}
    >
      <img
        src="/edusaz-mark.svg"
        alt={wordmark ? '' : label}
        width={Math.round(size * 1.13)}
        height={size}
        style={{ display: 'block', width: Math.round(size * 1.13), height: size, flexShrink: 0 }}
      />
      {wordmark && (
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: Math.round(size * 0.66),
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: tone === 'light' ? '#ffffff' : '#17142a',
          }}
        >
          edusaz
        </span>
      )}
    </span>
  );
}
