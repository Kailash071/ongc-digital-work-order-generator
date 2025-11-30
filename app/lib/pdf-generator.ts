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
    // Convert logo to base64
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    const getLogoBase64 = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(logoImg, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            reject('Failed to get canvas context');
          }
        };
        logoImg.onerror = () => reject('Failed to load logo');
        logoImg.src = '/ongc_logo.png';
      });
    };

    let logoBase64 = '';
    try {
      logoBase64 = await getLogoBase64();
    } catch (error) {
      console.warn('Could not load logo, proceeding without it:', error);
    }

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
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.6; color: black; max-width: 800px; margin: 0 auto; padding: 40px;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            ${logoBase64 ? `<img src="${logoBase64}" alt="ONGC Logo" style="height: 64px; width: auto; margin-right: 16px;"/>` : ''}
            <div>
              <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 1px;">OIL AND NATURAL GAS CORPORATION</h1>
              <h2 style="font-size: 18px; font-weight: 600; margin: 0; color: #333;">OPERATION GROUP MEHASANA ASSET</h2>
            </div>
          </div>
          <div style="text-align: center;">
            <p style="font-weight: 600; margin: 0;">Work Order no- ${data.workOrderNo}</p>
          </div>
        </div>

        <!-- Work Order Section -->
        <div style="margin-bottom: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: bold; margin: 0; letter-spacing: 1px; text-transform: uppercase;">WORK ORDER AND COMPLETION CERTIFICATION</h3>
            <p style="font-size: 14px; margin: 4px 0; font-weight: 500;">(Leakage Repairs)</p>
          </div>

          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <span style="font-weight: 600;">Name of Installation:</span>
                <span style="margin-left: 8px; font-weight: bold;">${data.installationName}</span>
              </div>
              <div>
                <span style="font-weight: 600;">DATE:</span>
                <span style="margin-left: 8px; font-weight: bold;">${formatDate(data.date)}</span>
              </div>
            </div>
            <div style="text-align: center; border-top: 1px solid black; border-bottom: 1px solid black; padding: 8px;">
              <p style="font-weight: bold; margin: 0; font-size: 18px;">(WORK ORDER)</p>
            </div>
          </div>

          <div style="margin-bottom: 24px; line-height: 1.8;">
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Kindly attend following:</span>
              <span style="font-weight: bold; margin-left: 8px;">${data.workDescription}</span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Details of line:</span>
              <span style="margin-left: 8px;">${data.workDetails}</span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Name of the land owner:</span>
              <span style="font-weight: bold; margin-left: 8px;">${data.landOwner}</span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Leakage Information Report No.:</span>
              <span style="margin-left: 8px;">${data.leakageReportNo || 'N/A'}</span>
            </p>
            
            <p style="text-align: center; font-weight: 600; border-top: 1px solid black; border-bottom: 1px solid black; padding: 8px; margin: 16px 0;">
              Material Supplied by the Contractor
            </p>
          </div>

          <!-- Materials Table -->
          <div style="margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid black;">
              <thead>
                <tr style="border-bottom: 2px solid black;">
                  <th style="padding: 12px; text-align: left; font-weight: bold; border-right: 1px solid black;">DESCRIPTION</th>
                  <th style="padding: 12px; text-align: center; font-weight: bold; border-right: 1px solid black;">QUANTITY</th>
                  <th style="padding: 12px; text-align: center; font-weight: bold;">UNIT</th>
                </tr>
              </thead>
              <tbody>
                ${data.materials.map((material) => `
                  <tr style="border-bottom: 1px solid black;">
                    <td style="padding: 12px; text-align: left; border-right: 1px solid black;">${material.description}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; border-right: 1px solid black;">${material.quantity}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 600;">${material.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="text-align: right; margin-top: 32px; padding-top: 24px;">
            <p style="font-weight: 600; margin-bottom: 12px;">Signature of instt I/C</p>
            <div style="margin-left: auto; border-bottom: 2px solid black; width: 200px;"></div>
          </div>
        </div>

        <!-- Completion Certificate Section -->
        <div style="border-top: 2px solid black; padding-top: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: bold; margin: 0; letter-spacing: 1px; text-transform: uppercase;">COMPLETION CERTIFICATE</h3>
          </div>
          
          <div style="margin-bottom: 32px; line-height: 1.8;">
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Certified that the following:</span>
              <span style="font-weight: bold; margin-left: 8px;">${data.workDescription}</span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Details of Repair:</span>
              <span style="margin-left: 8px;">${data.workDetails}</span>
            </p>

            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <p style="margin: 0; width: 48%;">
                <span style="font-weight: 600;">Clamping:</span>
                <span style="margin-left: 8px;">${data.clamping || 'N/A'}</span>
              </p>
              <p style="margin: 0; width: 48%;">
                <span style="font-weight: 600;">Length pipe Changed:</span>
                <span style="margin-left: 8px;">${data.lengthPipeChanged || 'N/A'}</span>
              </p>
            </div>

            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Jobs Done: -</span>
              <span style="margin-left: 8px; font-weight: bold;">${data.jobType}</span>
            </p>

            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Name of the Agency:</span>
              <span style="margin-left: 8px; font-weight: bold;">${data.agencyName}</span>
            </p>

            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Job taken on:</span>
              <span style="margin-left: 8px; font-weight: bold;">at ${formatDate(data.date)} hours ${formatTime(data.jobTakenTime)}</span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Job completed on:</span>
              <span style="margin-left: 8px; font-weight: bold;">at ${formatDate(data.date)} hours ${formatTime(data.jobCompletedTime)}</span>
            </p>

            <p style="margin: 0 0 16px 0;">
              <span style="font-weight: 600;">Line Retrieved and ope:</span>
              <span style="margin-left: 8px;">at hours ${data.lineRetrieved || ''}</span>
            </p>
          </div>

          <!-- Signature Section -->
          <div style="margin-top: 48px; padding-top: 24px;">
            <div style="display: flex; justify-content: space-between; gap: 64px;">
              <div style="text-align: center; width: 45%;">
                <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">Signature of C & M</p>
                <p style="font-weight: 500; margin-bottom: 16px;">With Date:</p>
                <div style="margin-top: 48px; border-bottom: 2px solid black; width: 100%;"></div>
              </div>
              <div style="text-align: center; width: 45%;">
                <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">Signature of Instt</p>
                <p style="font-weight: 500; margin-bottom: 16px;">With Date:</p>
                <div style="margin-top: 48px; border-bottom: 2px solid black; width: 100%;"></div>
              </div>
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

  const docContent = `                           OIL AND NATURAL GAS CORPORATION
                         OPERATION GROUP MEHASANA ASSET

                                Work Order no- ${data.workOrderNo}

                        WORK ORDER AND COMPLETION CERTIFICATION
                                   (Leakage Repairs)

Name of Installation: ${data.installationName}                              DATE: ${formatDate(data.date)}
                                       (WORK ORDER)

Kindly attend following: ${data.workDescription}
Details of line: ${data.workDetails}
Name of the land owner: ${data.landOwner}
Leakage Information Report No. ${data.leakageReportNo || 'N/A'}

                           Material Supplied by the Contractor

${data.materials.map(material => 
  `${material.description.padEnd(50)}${material.quantity.padStart(10)}       ${material.unit}`
).join('\n')}

                                                               Signature of instt I/C


                                COMPLETION CERTIFICATE

Certified that the following: ${data.workDescription}
Details of Repair: ${data.workDetails}
Clamping: ${data.clamping || 'N/A'}
Length pipe Changed: ${data.lengthPipeChanged || 'N/A'}
Jobs Done: - ${data.jobType}
Name of the Agency: ${data.agencyName}
Job taken on: at ${formatDate(data.date)} hours ${data.jobTakenTime}
Job completed on: at ${formatDate(data.date)} hours ${data.jobCompletedTime}
Line Retrieved and ope: at hours ${data.lineRetrieved || ''}


Signature of C & M                                                               Signature of Instt
With Date:                                                                       With Date:


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
