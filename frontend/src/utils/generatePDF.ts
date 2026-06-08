import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generatePropertyReport(property: any, history: any[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header bar
  doc.setFillColor(10, 22, 40); // #0A1628
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BhoomiChain — Property Title Report', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Blockchain Land Registry of India — Simulated Demo', 14, 20);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 14, 20, { align: 'right' });
  
  // Property ID box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(27, 79, 138);
  doc.roundedRect(14, 34, pageWidth - 28, 16, 3, 3, 'FD');
  doc.setTextColor(27, 79, 138);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Property ID: ' + property.propertyId, 20, 44);
  
  // Status badge
  const statusColors: any = { CLEAR: [22, 163, 74], DISPUTED: [217, 119, 6], COURT_FREEZE: [220, 38, 38], UNDER_LIEN: [27, 79, 138] };
  const color = statusColors[property.status] || [100, 116, 139];
  doc.setFillColor(...color);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.roundedRect(pageWidth - 50, 36, 36, 12, 2, 2, 'F');
  doc.text(property.status || 'UNKNOWN', pageWidth - 32, 44, { align: 'center' });
  
  // Property details table
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Details', 14, 62);
  
  ;(doc as any).autoTable({
    startY: 66,
    head: [],
    body: [
      ['Owner Name', property.ownerName || '-'],
      ['PAN', property.pan || '-'],
      ['Aadhaar (Last 4)', property.aadhaarLast4 || '-'],
      ['City', property.city || '-'],
      ['Property Type', property.propertyType || '-'],
      ['Survey Number', property.surveyNo || '-'],
      ['Khasra Number', property.khasraNo || '-'],
      ['Area', property.area ? property.area.toLocaleString('en-IN') + ' sq ft' : '-'],
      ['Circle Rate', property.circleRate ? '₹' + property.circleRate.toLocaleString('en-IN') + '/sqft' : '-'],
      ['Declared Value', property.declaredValue ? '₹' + property.declaredValue.toLocaleString('en-IN') : '-'],
      ['Stamp Duty Paid', property.stampDuty ? '₹' + property.stampDuty.toLocaleString('en-IN') : '-'],
      ['GPS Coordinates', property.gpsLat && property.gpsLng ? property.gpsLat + ', ' + property.gpsLng : '-'],
    ],
    theme: 'grid',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] }, 1: { cellWidth: 'auto' } },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 14, right: 14 }
  });
  
  // Transaction history table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction History (Blockchain)', 14, finalY);
  
  ;(doc as any).autoTable({
    startY: finalY + 4,
    head: [['Block #', 'Event Type', 'Owner', 'Value (₹)', 'Date', 'Hash']],
    body: history.filter(b => b.blockNumber > 0).map(b => [
      b.blockNumber,
      b.data?.eventType || '-',
      b.data?.ownerName || b.data?.newOwner || '-',
      b.data?.declaredValue ? b.data.declaredValue.toLocaleString('en-IN') : '-',
      new Date(b.timestamp).toLocaleDateString('en-IN'),
      b.hash ? b.hash.substring(0, 16) + '...' : '-'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [10, 22, 40], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('BhoomiChain — Simulated Demo | Not a legal document | For demonstration purposes only', 14, doc.internal.pageSize.getHeight() - 8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
  }
  
  doc.save(`BhoomiChain_${property.propertyId}_Report.pdf`);
}

export function generateLedgerSummary(chain: any[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BhoomiChain — Global Ledger Summary', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 20);

  ;(doc as any).autoTable({
    startY: 34,
    head: [['Block #', 'Event Type', 'Property ID', 'Owner', 'City', 'Value (₹)', 'Date']],
    body: chain.filter(b => b.blockNumber > 0).map(b => [
      b.blockNumber,
      b.data?.eventType || '-',
      b.data?.propertyId || '-',
      b.data?.ownerName || b.data?.newOwner || '-',
      b.data?.city || '-',
      b.data?.declaredValue ? b.data.declaredValue.toLocaleString('en-IN') : '-',
      new Date(b.timestamp).toLocaleDateString('en-IN'),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [10, 22, 40], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 }
  });

  doc.save(`BhoomiChain_Ledger_Summary.pdf`);
}
