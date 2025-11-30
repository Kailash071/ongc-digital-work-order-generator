import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface WorkOrderData {
  workOrderNo: string;
  installationName: string;
  date: string;
  workDescription: string;
  workDetails: string;
  landOwner: string;
  leakageReportNo?: string;
  materials: Array<{
    description: string;
    quantity: string;
    unit: string;
  }>;
  agencyName: string;
  jobTakenTime: string;
  jobCompletedTime: string;
  jobType: string;
  clamping?: string;
  lengthPipeChanged?: string;
  lineRetrieved?: string;
}

export const generatePDF = async (data: WorkOrderData) => {
  try {
    // Create a temporary div with the document content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Format date
    const formatDate = (dateStr: string) => {
      if (dateStr.includes('-') && dateStr.length === 10) {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
      }
      return dateStr;
    };

    // Format time
    const formatTime = (timeStr: string) => {
      if (timeStr.includes(':')) {
        return timeStr;
      }
      return timeStr;
    };

    tempDiv.innerHTML = `
      <div style="font-size: 12px; line-height: 1.4; color: black;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">OIL AND NATURAL GAS CORPORATION</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">OPERATION GROUP MEHASANA ASSET</h2>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Work Order no- <strong>${data.workOrderNo}</strong></span>
          </div>
        </div>

        <!-- Work Order Section -->
        <div style="margin-bottom: 30px;">
          <div style="text-align: center; margin-bottom: 15px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0;">WORK ORDER AND COMPLETION CERTIFICATION</h3>
            <p style="font-size: 11px; margin: 5px 0;">(Leakage Repairs)</p>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>NAME OF INSTALLATION <span style="margin-left: 50px;">${data.installationName}</span></span>
              <span>DATE: ${formatDate(data.date)}</span>
            </div>
            <p style="font-weight: bold; margin: 5px 0;">(WORK ORDER)</p>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="margin: 3px 0;">Kindly attend following: ${data.workDescription}</p>
            <p style="margin: 3px 0;">Details of line: ${data.workDetails}</p>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Name of the land owner:</span>
              <span style="margin-left: 20px;">${data.landOwner}</span>
            </div>
            <p style="margin: 3px 0;">Leakage Information Report No. ${data.leakageReportNo || ''}</p>
            <p style="margin: 3px 0;">Material Supplied by the Contractor.</p>
          </div>

          <!-- Materials Table -->
          <div style="margin: 15px 0;">
            ${data.materials.map(material => `
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #ccc;">
                <span style="flex: 3; text-align: left;">${material.description}</span>
                <span style="flex: 1; text-align: right; margin-right: 20px;">${material.quantity}</span>
                <span style="flex: 1; text-align: left;">${material.unit}</span>
              </div>
            `).join('')}
          </div>

          <div style="text-align: right; margin-top: 30px;">
            <p>Signature of instt I/C</p>
          </div>
        </div>

        <!-- Completion Certificate Section -->
        <div>
          <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 15px;">COMPLETION CERTIFICATE</h3>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 3px 0;">Certified that the following: ${data.workDescription}</p>
            <p style="margin: 3px 0;">Details of Repair: ${data.workDetails}</p>
            <p style="margin: 3px 0;">Clamping: ${data.clamping || ''}</p>
            <p style="margin: 3px 0;">Length pipe Changed: ${data.lengthPipeChanged || ''}</p>
            <p style="margin: 3px 0;">Jobs Done: - ${data.jobType}</p>
            <p style="margin: 3px 0;">Name of the Agency: ${data.agencyName}</p>
            <p style="margin: 3px 0;">Job taken on: at ${formatDate(data.date)} hours ${formatTime(data.jobTakenTime)}</p>
            <p style="margin: 3px 0;">Job completed on: at ${formatDate(data.date)} hours ${formatTime(data.jobCompletedTime)}</p>
            <p style="margin: 3px 0;">Line Retrieved and ope: at hours ${data.lineRetrieved || ''}</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div>
              <p>Signature of C & M</p>
              <p>With Date:</p>
            </div>
            <div style="text-align: right;">
              <p>Signature of Instt</p>
              <p>With Date:</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append to body temporarily
    document.body.appendChild(tempDiv);

    // Generate canvas from the content
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight,
    });

    // Remove the temporary div
    document.body.removeChild(tempDiv);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Download the PDF
    const fileName = `ONGC_WorkOrder_${data.workOrderNo}_${formatDate(data.date).replace(/-/g, '')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

// Alternative method for DOC generation (basic text format)
export const generateDOC = (data: WorkOrderData) => {
  const formatDate = (dateStr: string) => {
    if (dateStr.includes('-') && dateStr.length === 10) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const docContent = `
OIL AND NATURAL GAS CORPORATION
OPERATION GROUP MEHASANA ASSET

Work Order no- ${data.workOrderNo}

WORK ORDER AND COMPLETION CERTIFICATION
(Leakage Repairs)

NAME OF INSTALLATION                              ${data.installationName}                       DATE: ${formatDate(data.date)}
(WORK ORDER)
Kindly attend following: ${data.workDescription}
Details of line: ${data.workDetails}
Name of the land owner:	${data.landOwner}
Leakage Information Report No. ${data.leakageReportNo || ''}
Material Supplied by the Contractor.

${data.materials.map(material => 
  `${material.description.padEnd(50)}${material.quantity.padStart(10)}       ${material.unit}`
).join('\n')}

Signature of instt I/C

COMPLETION CERTIFICATE
Certified that the following: ${data.workDescription}
Details of Repair: ${data.workDetails}
Clamping: ${data.clamping || ''}
Length pipe Changed: ${data.lengthPipeChanged || ''}
Jobs Done: - ${data.jobType}
Name of the Agency: ${data.agencyName}
Job taken on: at ${formatDate(data.date)} hours ${data.jobTakenTime}
Job completed on: at ${formatDate(data.date)} hours ${data.jobCompletedTime}
Line Retrieved and ope: at hours ${data.lineRetrieved || ''}

Signature of C & M                                                               Signature of Instt
With Date:
  `;

  // Create and download DOC file
  const blob = new Blob([docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ONGC_WorkOrder_${data.workOrderNo}_${formatDate(data.date).replace(/-/g, '')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
