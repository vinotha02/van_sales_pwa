'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import jsPDF from 'jspdf';

interface SignaturePadProps {
    invoiceNum: string;
    customerName: string;
    onSigned?: (dataUrl: string) => void;
}

export default function SignaturePad({ invoiceNum, customerName, onSigned }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const [isSigned, setIsSigned] = useState(false);
    const [savedSignature, setSavedSignature] = useState<string | null>(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1d2d3e';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        isDrawing.current = true;
        lastPos.current = getPos(e, canvas);
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx || !lastPos.current) return;
        const pos = getPos(e, canvas);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;
        setIsSigned(true);
    }, []);

    const stopDraw = useCallback(() => {
        isDrawing.current = false;
        lastPos.current = null;
    }, []);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsSigned(false);
        setSavedSignature(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas || !isSigned) return;
        const dataUrl = canvas.toDataURL('image/png');
        setSavedSignature(dataUrl);
        onSigned?.(dataUrl);
    };

    const downloadPdf = () => {
        if (!savedSignature) return;
        const pdf = new jsPDF('p', 'mm', 'a5');
        pdf.setFontSize(16);
        pdf.text('Proof of Delivery (POD)', 20, 20);
        pdf.setFontSize(12);
        pdf.text(`Customer: ${customerName}`, 20, 30);
        pdf.text(`Invoice No: ${invoiceNum}`, 20, 40);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        
        pdf.text('Signature:', 20, 70);
        pdf.addImage(savedSignature, 'PNG', 20, 80, 100, 30);
        
        pdf.save(`POD_${invoiceNum}.pdf`);
    };

    return (
        <div style={{
            margin: '1.5rem 0',
            border: '1px solid #e5e7eb',
            borderRadius: '1rem',
            overflow: 'hidden',
            background: '#f9fafb',
            textAlign: 'left',
        }}>
            {/* Header */}
            <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e5e7eb',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1d2d3e' }}>
                        Customer Signature (POD)
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                        {customerName} · Invoice {invoiceNum}
                    </p>
                </div>
                {savedSignature && (
                    <span style={{
                        background: '#d1fae5',
                        color: '#065f46',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '2rem',
                    }}>
                        ✓ Signed
                    </span>
                )}
            </div>

            {savedSignature ? (
                /* Show saved signature */
                <div style={{ padding: '0.75rem 1rem', background: '#fff' }}>
                    <img
                        src={savedSignature}
                        alt="Customer Signature"
                        style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'contain',
                            border: '1px dashed #d1d5db',
                            borderRadius: '0.5rem',
                            background: '#fff',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={clearSignature}
                            style={{
                                fontSize: '0.75rem',
                                color: '#ef4444',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontWeight: 600,
                            }}
                        >
                            Re-sign
                        </button>
                        <button
                            onClick={downloadPdf}
                            style={{
                                fontSize: '0.75rem',
                                color: '#1190ea',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontWeight: 600,
                            }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>
            ) : (
                /* Drawing pad */
                <>
                    <div style={{ padding: '0.5rem', background: '#f9fafb' }}>
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={160}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={stopDraw}
                            style={{
                                width: '100%',
                                height: '130px',
                                display: 'block',
                                borderRadius: '0.5rem',
                                background: '#ffffff',
                                border: '1.5px dashed #cbd5e1',
                                cursor: 'crosshair',
                                touchAction: 'none',
                            }}
                        />
                        {!isSigned && (
                            <p style={{
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                color: '#9ca3af',
                                margin: '0.4rem 0 0 0',
                                pointerEvents: 'none',
                            }}>
                                ✍️ Sign above with finger or mouse
                            </p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{
                        padding: '0.6rem 1rem',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                        borderTop: '1px solid #f3f4f6',
                        background: '#fff',
                    }}>
                        <button
                            onClick={clearSignature}
                            disabled={!isSigned}
                            style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #d1d5db',
                                background: '#f9fafb',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: isSigned ? 'pointer' : 'not-allowed',
                                opacity: isSigned ? 1 : 0.4,
                                color: '#374151',
                            }}
                        >
                            Clear
                        </button>
                        <button
                            onClick={saveSignature}
                            disabled={!isSigned}
                            style={{
                                padding: '0.4rem 1.2rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: isSigned ? '#1190ea' : '#cbd5e1',
                                color: '#fff',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: isSigned ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                            }}
                        >
                            ✓ Confirm Signature
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
