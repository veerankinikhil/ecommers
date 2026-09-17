import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

/**
 * Real Compliant Code 128 Barcode Visual Component
 * @param {string} code - The order number or parcel code (e.g. ORD-260912-722101)
 * @param {number} width - Bar width scale
 * @param {number} height - Barcode bars height
 * @param {boolean} showLabel - Whether to display text label underneath
 */
export default function BarcodeVisual({ code = 'ORD-260912-722101', width = 1.6, height = 36, showLabel = true }) {
  const svgRef = useRef(null);
  const rawCode = String(code || 'ORD-000000').toUpperCase();

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, rawCode, {
          format: 'CODE128',
          lineColor: '#0F172A',
          width: width,
          height: height,
          displayValue: showLabel,
          font: 'monospace',
          fontSize: 11,
          textMargin: 3,
          margin: 4,
          background: 'transparent'
        });
      } catch (e) {
        console.warn('JsBarcode render error in BarcodeVisual:', e);
      }
    }
  }, [rawCode, width, height, showLabel]);

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#FFFFFF',
      padding: '4px 8px',
      borderRadius: '6px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden'
    }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></svg>
    </div>
  );
}
