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
        <div style="text-align: center; border-bottom: 4px solid black; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 16px;">
            ${logoBase64 ? `<img src="${logoBase64}" alt="ONGC Logo" style="height: 64px; width: auto; margin-right: 24px;"/>` : ''}
            <div style="text-align: center; flex: 1;">
              <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 15px 0; letter-spacing: 2px; text-transform: uppercase;">OIL AND NATURAL GAS CORPORATION</h1>
              <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; letter-spacing: 1px; text-transform: uppercase;">OPERATION GROUP MEHASANA ASSET</h2>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold;">
            <span>Work Order no- </span>
            <span style="font-weight: bold;">${data.workOrderNo}</span>
          </div>
        </div>

        <!-- Work Order Section -->
        <div style="margin-bottom: 40px;">
          <div style="text-align: center; margin-bottom: 20px; background-color: #f8f9fa; padding: 12px; border: 1px solid #dee2e6;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0; letter-spacing: 1px; text-transform: uppercase;">WORK ORDER AND COMPLETION CERTIFICATION</h3>
            <p style="font-size: 12px; margin: 5px 0; font-weight: 600;">(Leakage Repairs)</p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f1f3f4; padding: 16px; border-left: 4px solid #1976d2;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
              <div>
                <span style="font-weight: 600;">NAME OF INSTALLATION:</span>
                <span style="margin-left: 8px; font-weight: bold; color: #1565c0;">${data.installationName}</span>
              </div>
              <div style="text-align: right;">
                <span style="font-weight: 600;">DATE:</span>
                <span style="margin-left: 8px; font-weight: bold; color: #1565c0;">${formatDate(data.date)}</span>
              </div>
            </div>
            <div style="text-align: center;">
              <p style="font-weight: bold; margin: 0; font-size: 18px; letter-spacing: 1px;">(WORK ORDER)</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; line-height: 1.8;">
            <div style="border-left: 4px solid #4caf50; padding-left: 16px; margin-bottom: 12px;">
              <p style="margin: 0; font-size: 14px;">
                <span style="font-weight: 600;">Kindly attend following:</span><br/>
                <span style="font-weight: bold; color: #2e7d32; font-size: 16px;">${data.workDescription}</span>
              </p>
            </div>
            
            <div style="border-left: 4px solid #ff9800; padding-left: 16px; margin-bottom: 12px;">
              <p style="margin: 0; font-size: 14px;">
                <span style="font-weight: 600;">Details of line:</span><br/>
                <span style="font-weight: 500; color: #f57c00;">${data.workDetails}</span>
              </p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #fffde7; padding: 12px; border: 1px solid #f9a825; margin-bottom: 8px;">
              <span style="font-weight: 600;">Name of the land owner:</span>
              <span style="font-weight: bold; color: #f57f17;">${data.landOwner}</span>
            </div>
            
            <p style="margin: 8px 0;">
              <span style="font-weight: 600;">Leakage Information Report No.:</span>
              <span style="margin-left: 8px; font-weight: 500;">${data.leakageReportNo || 'N/A'}</span>
            </p>
            
            <p style="text-align: center; font-weight: 600; background-color: #e3f2fd; padding: 8px; border: 1px solid #2196f3; margin: 8px 0;">
              Material Supplied by the Contractor
            </p>
          </div>

          <!-- Materials Table -->
          <div style="margin: 20px 0;">
            <div style="background-color: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #e9ecef; padding: 12px; border-bottom: 1px solid #dee2e6;">
                <h4 style="margin: 0; font-weight: bold; text-align: center;">MATERIALS LIST</h4>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f1f3f4; border-bottom: 2px solid #9e9e9e;">
                    <th style="padding: 12px; text-align: left; font-weight: bold; border-right: 1px solid #dee2e6;">DESCRIPTION</th>
                    <th style="padding: 12px; text-align: center; font-weight: bold; border-right: 1px solid #dee2e6;">QUANTITY</th>
                    <th style="padding: 12px; text-align: center; font-weight: bold;">UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.materials.map((material, index) => `
                    <tr style="border-bottom: 1px solid #dee2e6; background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                      <td style="padding: 12px; text-align: left; font-weight: 500; border-right: 1px solid #dee2e6;">${material.description}</td>
                      <td style="padding: 12px; text-align: center; font-weight: bold; color: #1565c0; border-right: 1px solid #dee2e6;">${material.quantity}</td>
                      <td style="padding: 12px; text-align: center; font-weight: 600;">${material.unit}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div style="text-align: right; margin-top: 40px; border-top: 1px solid #9e9e9e; padding-top: 16px;">
            <p style="font-weight: 600;">Signature of instt I/C</p>
            <div style="margin-top: 8px; margin-left: auto; border-bottom: 2px solid black; width: 200px;"></div>
          </div>
        </div>

        <!-- Completion Certificate Section -->
        <div style="border-top: 4px solid black; padding-top: 30px;">
          <div style="text-align: center; margin-bottom: 20px; background-color: #e8f5e8; padding: 12px; border: 1px solid #4caf50;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0; letter-spacing: 1px; text-transform: uppercase;">COMPLETION CERTIFICATE</h3>
          </div>
          
          <div style="margin-bottom: 30px; line-height: 1.8;">
            <div style="background-color: #e8f5e8; padding: 16px; border-left: 4px solid #4caf50; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 14px;">
                <span style="font-weight: 600;">Certified that the following:</span><br/>
                <span style="font-weight: bold; color: #2e7d32;">${data.workDescription}</span>
              </p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 16px; border-left: 4px solid #2196f3; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 14px;">
                <span style="font-weight: 600;">Details of Repair:</span><br/>
                <span style="font-weight: 500; color: #1565c0;">${data.workDetails}</span>
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div style="background-color: #f8f9fa; padding: 12px; border: 1px solid #dee2e6;">
                <span style="font-weight: 600;">Clamping:</span>
                <span style="margin-left: 8px; font-weight: 500;">${data.clamping || 'N/A'}</span>
              </div>
              <div style="background-color: #f8f9fa; padding: 12px; border: 1px solid #dee2e6;">
                <span style="font-weight: 600;">Length pipe Changed:</span>
                <span style="margin-left: 8px; font-weight: 500;">${data.lengthPipeChanged || 'N/A'}</span>
              </div>
            </div>

            <div style="background-color: #fffde7; padding: 16px; border: 1px solid #f9a825; border-radius: 4px; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 14px;">
                <span style="font-weight: 600;">Jobs Done:</span>
                <span style="margin-left: 8px; font-weight: bold; color: #f57f17;">${data.jobType}</span>
              </p>
            </div>

            <div style="background-color: #f3e5f5; padding: 16px; border: 1px solid #9c27b0; border-radius: 4px; margin-bottom: 16px;">
              <p style="margin: 0; font-size: 14px;">
                <span style="font-weight: 600;">Name of the Agency:</span>
                <span style="margin-left: 8px; font-weight: bold; color: #7b1fa2;">${data.agencyName}</span>
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div style="background-color: #e8f5e8; padding: 12px; border: 1px solid #4caf50;">
                <span style="font-weight: 600;">Job taken on:</span><br/>
                <span style="color: #2e7d32; font-weight: bold;">${formatDate(data.date)} at ${formatTime(data.jobTakenTime)} hours</span>
              </div>
              <div style="background-color: #ffebee; padding: 12px; border: 1px solid #f44336;">
                <span style="font-weight: 600;">Job completed on:</span><br/>
                <span style="color: #c62828; font-weight: bold;">${formatDate(data.date)} at ${formatTime(data.jobCompletedTime)} hours</span>
              </div>
            </div>

            <div style="background-color: #f8f9fa; padding: 12px; border: 1px solid #dee2e6;">
              <span style="font-weight: 600;">Line Retrieved and ope:</span>
              <span style="margin-left: 8px; font-weight: 500;">at ${data.lineRetrieved || 'N/A'} hours</span>
            </div>
          </div>

          <!-- Signature Section -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #9e9e9e;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div style="text-align: center; background-color: #e3f2fd; padding: 20px; border: 2px solid #2196f3; border-radius: 4px;">
                <p style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">Signature of C & M</p>
                <p style="font-weight: 600; margin-bottom: 16px;">With Date:</p>
                <div style="margin-top: 30px; border-bottom: 2px solid black; width: 100%;"></div>
                <p style="font-size: 10px; color: #666; margin-top: 8px;">Construction & Maintenance</p>
              </div>
              <div style="text-align: center; background-color: #e8f5e8; padding: 20px; border: 2px solid #4caf50; border-radius: 4px;">
                <p style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">Signature of Instt</p>
                <p style="font-weight: 600; margin-bottom: 16px;">With Date:</p>
                <div style="margin-top: 30px; border-bottom: 2px solid black; width: 100%;"></div>
                <p style="font-size: 10px; color: #666; margin-top: 8px;">Installation In-Charge</p>
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
