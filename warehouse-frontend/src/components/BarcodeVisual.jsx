import React from 'react';

/**
 * Authentic Barcode Visual Component using deterministic SVG lines
 * @param {string} code - The order number or 6-digit code
 * @param {number} width - SVG width
 * @param {number} height - Barcode bars height
 */
export default function BarcodeVisual({ code = '722101', width = 140, height = 32, showLabel = true }) {
  const cleanCode = String(code || '000000').toUpperCase();
  const parts = cleanCode.split('-');
  const displayDigits = parts.length > 1 ? parts[parts.length - 1] : cleanCode.slice(-6);

  const bars = [];
  let currentX = 6;

  // Lead guard bars
  bars.push({ x: currentX, w: 2 }); currentX += 4;
  bars.push({ x: currentX, w: 2 }); currentX += 4;

  for (let i = 0; i < displayDigits.length; i++) {
    const charCode = displayDigits.charCodeAt(i);
    const w1 = ((charCode % 3) + 1) * 1.5;
    const w2 = (((charCode >> 1) % 2) + 1) * 1.5;
    bars.push({ x: currentX, w: w1 });
    currentX += w1 + 2;
    bars.push({ x: currentX, w: w2 });
    currentX += w2 + 3;
  }

  // Trailing guard bars
  bars.push({ x: currentX, w: 2 }); currentX += 4;
  bars.push({ x: currentX, w: 2 }); currentX += 4;

  const svgWidth = Math.max(width, currentX + 6);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
      <svg width={svgWidth} height={height} viewBox={`0 0 ${svgWidth} ${height}`} style={{ display: 'block' }}>
        {bars.map((b, idx) => (
          <rect
            key={idx}
            x={b.x}
            y={2}
            width={b.w}
            height={height - 4}
            fill="#0F172A"
            rx={0.5}
          />
        ))}
      </svg>
      {showLabel && (
        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.72rem',
          fontWeight: '800',
          letterSpacing: '2px',
          color: '#0F172A',
          marginTop: '2px',
          textAlign: 'center'
        }}>
          *{displayDigits}*
        </div>
      )}
    </div>
  );
}
