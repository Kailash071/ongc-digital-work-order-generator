# ONGC Mehasana Work Order Management System

A professional web application for generating Work Order and Completion Certification documents for ONGC (Oil and Natural Gas Corporation) Mehasana Asset operations.

## Features

✅ **Dynamic Form Interface**
- Input fields for all document details (Work Order No, Installation Name, Date, etc.)
- Dynamic materials list with add/remove functionality
- Form validation using Zod schema
- Professional UI with Tailwind CSS

✅ **Document Template**
- Exact replica of ONGC work order format
- Professional layout matching official documents
- Dynamic content population from form data

✅ **Preview Functionality**
- Live preview of generated document
- Edit capability before finalizing
- Professional document formatting

✅ **Download Options**
- **PDF Download**: High-quality PDF generation using jsPDF and html2canvas
- **DOC Download**: Microsoft Word compatible document format
- Automatic filename generation with work order number and date

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React

## Usage Instructions

### 1. Fill the Work Order Form
- **Work Order No**: Enter unique work order number
- **Installation Name**: e.g., "Santhal Main"
- **Date**: Select work date
- **Work Description**: Brief description of work
- **Work Details**: Detailed description
- **Agency Name**: Contractor agency name

### 2. Add Materials
- Click "Add Material" to add items
- Fill in:
  - **Description**: e.g., "3'' 3LPE PIPE"
  - **Quantity**: e.g., "28.800"
  - **Unit**: Select from dropdown (NOS, MTR, HRS, SET, BAGS, MTR CUBE)
- Remove items with trash icon

### 3. Set Job Timing
- **Job Taken Time**: Start time
- **Job Completed Time**: End time
- **Job Type**: U/G JOB, O/H JOB, or MAINTENANCE

### 4. Optional Fields
- Leakage Report No.
- Clamping details
- Length pipe changed

### 5. Preview & Download
- Click "Preview Document" to see formatted document
- Review all details in official ONGC format
- Click "Back to Edit" if changes needed
- Download as PDF or DOC format

## Running the Application

1. **Install Dependencies** (already done):
```bash
npm install
```

2. **Start Development Server**:
```bash
npm run dev
```

3. **Open Browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## File Structure

```
├── app/
│   ├── page.tsx              # Main form interface & preview
│   ├── layout.tsx            # App layout and metadata
│   ├── globals.css           # Global styles
│   └── lib/
│       └── pdf-generator.ts  # PDF/DOC generation utilities
├── package.json              # Dependencies and scripts
└── README.md                # This file
```

## Form Fields Reference

### Required Fields
- Work Order No.
- Installation Name  
- Date
- Work Description
- Work Details
- Agency Name
- Job Taken Time
- Job Completed Time
- At least one material item

### Optional Fields
- Leakage Information Report No.
- Clamping
- Length Pipe Changed
- Line Retrieved

## Document Output

The generated document includes:

**Work Order Section:**
- Company header (OIL AND NATURAL GAS CORPORATION)
- Work order details
- Materials list in tabular format
- Signature section

**Completion Certificate Section:**
- Certification details
- Job timing information
- Agency information
- Signature sections for C&M and Inspector

## Download Formats

1. **PDF**: Professional quality, preserves exact formatting
2. **DOC**: Microsoft Word compatible for further editing

Files are automatically named: `ONGC_WorkOrder_{WorkOrderNo}_{Date}.pdf/doc`

## Support

For any issues or modifications needed, ensure all form fields are properly filled before generating the document. The system validates all required fields and provides error messages for missing information.

## Customization

The document template can be modified in:
- Form fields: `app/page.tsx`
- PDF generation: `app/lib/pdf-generator.ts`
- Styling: Tailwind classes in components