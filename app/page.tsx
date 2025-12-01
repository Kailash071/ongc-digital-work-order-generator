'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { FileText, Plus, Trash2, Download, Eye, Building2, Printer, Loader2, ArrowUp } from 'lucide-react';
import { generatePDF } from './lib/pdf-generator'; // generateDOC commented out

// Import JSON data
import workDescriptionsData from './data/workDescriptions.json';
import materialsData from './data/materials.json';
import installationsData from './data/installations.json';
import agenciesData from './data/agencies.json';
import unitsData from './data/units.json';
import jobTypesData from './data/jobTypes.json';

// Form schema
const workOrderSchema = z.object({
  workOrderNo: z.string().min(1, 'Work Order No. is required'),
  installationName: z.string().min(1, 'Installation Name is required'),
  date: z.string().min(1, 'Date is required'),
  workDescription: z.string().min(1, 'Work Description is required'),
  workDetails: z.string().min(1, 'Work Details are required'),
  landOwner: z.string().default('COMPLETED'),
  leakageReportNo: z.string().optional(),
  materials: z.array(z.object({
    description: z.string().min(1, 'Material description is required'),
    quantity: z.string().min(1, 'Quantity is required'),
    unit: z.string().min(1, 'Unit is required'),
  })).min(1, 'At least one material item is required'),
  agencyName: z.string().min(1, 'Agency Name is required'),
  jobTakenTime: z.string().min(1, 'Job Taken Time is required'),
  jobCompletedTime: z.string().min(1, 'Job Completed Time is required'),
  jobType: z.string().default('U/G JOB'),
  clamping: z.string().optional(),
  lengthPipeChanged: z.string().optional(),
  lineRetrieved: z.string().optional(),
});

type WorkOrderData = z.infer<typeof workOrderSchema>;

// Transform JSON data to react-select format
const workDescriptionOptions = workDescriptionsData.map(item => ({ value: item, label: item }));
const materialOptions = materialsData.map(item => ({ value: item, label: item }));
const installationOptions = installationsData.map(item => ({ value: item, label: item }));
const agencyOptions = agenciesData.map(item => ({ value: item, label: item }));

// Custom styles for react-select
const customSelectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: '48px',
    border: '2px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    '&:hover': {
      borderColor: '#9ca3af'
    },
    '&:focus-within': {
      borderColor: 'transparent',
      boxShadow: '0 0 0 2px #6b7280'
    }
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: '0 16px'
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: '#6b7280',
    fontSize: '0.875rem'
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: '#111827',
    fontSize: '0.875rem'
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: '#111827',
    fontSize: '0.875rem'
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 50
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    padding: '4px 0',
    maxHeight: '200px'
  }),
  option: (base: Record<string, unknown>, { isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    backgroundColor: isSelected ? '#6b7280' : isFocused ? '#f3f4f6' : '#ffffff',
    color: isSelected ? '#ffffff' : '#111827',
    fontSize: '0.875rem',
    padding: '8px 16px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: isSelected ? '#6b7280' : '#e5e7eb'
    }
  }),
  noOptionsMessage: (base: Record<string, unknown>) => ({
    ...base,
    color: '#6b7280',
    fontSize: '0.875rem',
    padding: '8px 16px'
  }),
  loadingMessage: (base: Record<string, unknown>) => ({
    ...base,
    color: '#6b7280',
    fontSize: '0.875rem',
    padding: '8px 16px'
  })
};

// Navbar Component
function Navbar() {

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="bg-white p-1 md:p-2 rounded-lg">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-gray-700" />
              </div>
              <div className="text-white">
                <h1 className="font-bold text-sm md:text-lg">ONGC Mehasana</h1>
                <p className="text-xs text-gray-100 hidden sm:block">Work Order Management</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-gray-200 text-sm">Digital Work Order Generator</span>
          </div>

          {/* Mobile info */}
          <div className="md:hidden">
            <span className="text-gray-200 text-xs">Digital Generator</span>
          </div>
        </div>

      </div>
    </nav>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 md:py-8 mt-8 md:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-3 md:mb-4">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
              <span className="font-bold text-base md:text-lg">ONGC Mehasana</span>
            </div>
            <p className="text-gray-300 text-sm">
              Digital Work Order Management System for Oil and Natural Gas Corporation, Mehasana Asset Operations.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Features</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Dynamic Form Builder</li>
              <li>• Live Document Preview</li>
              <li>• PDF & DOC Export</li>
              <li>• Professional Templates</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Contact</h3>
            <p className="text-gray-300 text-sm">
              Operation Group Mehasana Asset<br />
              Oil and Natural Gas Corporation<br />
              Gujarat, India
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
            <p className="text-xs sm:text-sm">&copy; 2025 Oil and Natural Gas Corporation. All rights reserved.</p>
            <p className="text-xs sm:text-sm">
              Powered by{' '}
              <a 
                href="https://kailashpro.co.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium underline"
              >
                Kailash Tech
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Scroll to Top Component
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top coordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden">
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<WorkOrderData | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      workOrderNo: '',
      installationName: 'Santhal Main',
      date: format(new Date(), 'yyyy-MM-dd'),
      workDescription: '',
      workDetails: '',
      landOwner: 'COMPLETED',
      agencyName: 'NAVBHARAT CONSTRUCTION',
      jobTakenTime: '10:00',
      jobCompletedTime: '18:00',
      jobType: 'U/G JOB',
      materials: [{ description: '', quantity: '', unit: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });

  const onSubmit = (data: WorkOrderData) => {
    setFormData(data);
    setIsPreviewMode(true);
  };

  const handleDownloadPDF = async () => {
    if (formData && !isPdfLoading) {
      setIsPdfLoading(true);
      try {
        await generatePDF(formData);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsPdfLoading(false);
      }
    }
  };

  // DOC download function commented out
  // const handleDownloadDOC = () => {
  //   if (formData) {
  //     generateDOC(formData);
  //   }
  // };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToEdit = () => {
    setIsPreviewMode(false);
  };

  if (isPreviewMode && formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="print-hide">
          <Navbar />
        </div>
        <DocumentPreview data={formData} onBack={handleBackToEdit} onDownloadPDF={handleDownloadPDF} onPrint={handlePrint} isPdfLoading={isPdfLoading} />
        <div className="print-hide">
          <Footer />
        </div>
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="bg-white/10 backdrop-blur-sm p-2 md:p-4 rounded-2xl">
              <FileText className="h-10 w-10 md:h-16 md:w-16 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight">
            OIL AND NATURAL GAS CORPORATION
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-3 text-blue-100">
            OPERATION GROUP MEHASANA ASSET
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Digital Work Order & Completion Certificate Generator
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs sm:text-sm px-2">
            <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full">📋 Dynamic Forms</span>
            <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full">👁️ Live Preview</span>
            <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full">📄 PDF & DOC Export</span>
            <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full">✅ Professional Format</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-6 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 sm:px-6 md:px-8 py-4 md:py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Create New Work Order</h3>
                  <p className="text-sm md:text-base text-gray-600">Fill in the details below to generate your work order document</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 md:p-8">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Order No. *
                  </label>
                  <input
                    type="text"
                    {...register('workOrderNo')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter work order number"
                  />
                  {errors.workOrderNo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.workOrderNo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Installation Name *
                  </label>
                  <Controller
                    name="installationName"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        options={installationOptions}
                        value={installationOptions.find(option => option.value === field.value) || { value: field.value, label: field.value }}
                        onChange={(option) => field.onChange(option?.value || '')}
                        placeholder="e.g., Santhal Main"
                        styles={customSelectStyles}
                        isClearable
                        isSearchable
                        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                      />
                    )}
                  />
                  {errors.installationName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.installationName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agency Name *
                  </label>
                  <Controller
                    name="agencyName"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        options={agencyOptions}
                        value={agencyOptions.find(option => option.value === field.value) || { value: field.value, label: field.value }}
                        onChange={(option) => field.onChange(option?.value || '')}
                        placeholder="e.g., NAVBHARAT CONSTRUCTION"
                        styles={customSelectStyles}
                        isClearable
                        isSearchable
                        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                      />
                    )}
                  />
                  {errors.agencyName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.agencyName.message}
                    </p>
                  )}
                </div>
                </div>
              </div>

              {/* Work Description Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Work Description
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Work Description *
                    </label>
                    <Controller
                      name="workDescription"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          options={workDescriptionOptions}
                          value={workDescriptionOptions.find(option => option.value === field.value) || { value: field.value, label: field.value }}
                          onChange={(option) => field.onChange(option?.value || '')}
                          placeholder="e.g., SN#15 WATER INJECTION HEADER MODIFICATION"
                          styles={customSelectStyles}
                          isClearable
                          isSearchable
                          formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                        />
                      )}
                    />
                    {errors.workDescription && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.workDescription.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Details of Line/Work *
                    </label>
                    <textarea
                      {...register('workDetails')}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Detailed description of the work to be performed"
                    />
                    {errors.workDetails && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.workDetails.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Materials Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Materials List
                  </h4>
                  <button
                    type="button"
                    onClick={() => append({ description: '', quantity: '', unit: '' })}
                    className="flex items-center justify-center p-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-10 h-10 flex-shrink-0"
                    title="Add Material"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 md:p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Material Description *
                        </label>
                        <Controller
                          name={`materials.${index}.description`}
                          control={control}
                          render={({ field }) => (
                            <CreatableSelect
                              {...field}
                              options={materialOptions}
                              value={materialOptions.find(option => option.value === field.value) || { value: field.value, label: field.value }}
                              onChange={(option) => field.onChange(option?.value || '')}
                              placeholder="e.g., 3'' 3LPE PIPE"
                              styles={customSelectStyles}
                              isClearable
                              isSearchable
                              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                            />
                          )}
                        />
                        {errors.materials?.[index]?.description && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.materials[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="text"
                          {...register(`materials.${index}.quantity`)}
                          className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                          placeholder="28.800"
                        />
                        {errors.materials?.[index]?.quantity && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.materials[index]?.quantity?.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1 min-w-0">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Unit *
                          </label>
                          <Controller
                            name={`materials.${index}.unit`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={unitsData}
                                value={unitsData.find(option => option.value === field.value) || null}
                                onChange={(option) => field.onChange(option?.value || '')}
                                placeholder="Unit"
                                styles={{
                                  ...customSelectStyles,
                                  control: (provided: Record<string, unknown>) => ({
                                    ...provided,
                                    minHeight: '48px',
                                    fontSize: '14px',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    backgroundColor: '#ffffff',
                                    '&:hover': {
                                      borderColor: '#9ca3af'
                                    }
                                  })
                                }}
                                isClearable
                                isSearchable
                              />
                            )}
                          />
                          {errors.materials?.[index]?.unit && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {errors.materials[index]?.unit?.message}
                            </p>
                          )}
                        </div>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="shrink-0 p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 self-start mt-8"
                            title="Remove material item"
                          >
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Timing Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Job Timing & Type
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Taken Time *
                    </label>
                    <input
                      type="time"
                      {...register('jobTakenTime')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                    />
                    {errors.jobTakenTime && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.jobTakenTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Completed Time *
                    </label>
                    <input
                      type="time"
                      {...register('jobCompletedTime')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                    />
                    {errors.jobCompletedTime && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.jobCompletedTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Type
                    </label>
                    <Controller
                      name="jobType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={jobTypesData}
                          value={jobTypesData.find(option => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option?.value || '')}
                          placeholder="Select Job Type"
                          styles={customSelectStyles}
                          isClearable
                          isSearchable
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Optional Fields Section */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Optional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Leakage Information Report No.
                    </label>
                    <input
                      type="text"
                      {...register('leakageReportNo')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter if applicable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Clamping
                    </label>
                    <input
                      type="text"
                      {...register('clamping')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter if applicable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Length Pipe Changed
                    </label>
                    <input
                      type="text"
                      {...register('lengthPipeChanged')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter if applicable"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-3 px-6 md:px-8 py-4 md:py-4 bg-gradient-to-r from-gray-600 via-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto min-h-[52px] max-w-xs sm:max-w-none mx-auto sm:mx-0"
                >
                  <Eye className="w-6 h-6 md:w-6 md:h-6" />
                  Preview Document
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

// Document Preview Component
function DocumentPreview({ data, onBack, onDownloadPDF, onPrint, isPdfLoading }: { 
  data: WorkOrderData; 
  onBack: () => void; 
  onDownloadPDF: () => void;
  onPrint: () => void;
  isPdfLoading: boolean;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Custom xs breakpoint for very small screens */
          @media (min-width: 375px) {
            .xs\\:text-xs { font-size: 0.75rem; }
            .xs\\:text-sm { font-size: 0.875rem; }
            .xs\\:text-base { font-size: 1rem; }
            .xs\\:h-8 { height: 2rem; }
            .xs\\:h-10 { height: 2.5rem; }
            .xs\\:w-8 { width: 2rem; }
            .xs\\:w-10 { width: 2.5rem; }
            .xs\\:w-32 { width: 8rem; }
            .xs\\:mt-6 { margin-top: 1.5rem; }
            .xs\\:mt-8 { margin-top: 2rem; }
            .xs\\:py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .xs\\:px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          }
          
          @media print {
            .print-hide {
              display: none !important;
            }
            #document-content {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 12px !important;
            }
            body {
              background: white !important;
            }
            header, nav, footer, .navbar, .footer {
              display: none !important;
            }
            .page-break-avoid {
              page-break-inside: avoid !important;
            }
            .signature-section {
              page-break-inside: avoid !important;
            }
            table {
              page-break-inside: avoid !important;
              font-size: 12px !important;
            }
            * {
              font-size: 12px !important;
            }
            h1, h2, h3 {
              font-size: 14px !important;
            }
          }
        `
      }} />
      <div className="flex-1 py-4 md:py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Action Bar */}
        <div className="print-hide flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-8 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base w-full sm:w-auto"
          >
            ← Back to Edit
          </button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onDownloadPDF}
              disabled={isPdfLoading}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 text-white rounded-xl transition-all duration-200 shadow-lg text-sm md:text-base w-full sm:w-auto justify-center ${
                isPdfLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isPdfLoading ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  Download PDF
                </>
              )}
            </button>
            {/* DOC Download commented out
            <button
              onClick={onDownloadDOC}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FileText className="w-5 h-5" />
              Download DOC
            </button>
            */}
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <Printer className="w-4 h-4 md:w-5 md:h-5" />
              Print Document
            </button>
          </div>
        </div>

        <div id="document-content" className="bg-white shadow-lg border border-gray-300 mx-2 sm:mx-0">
          <div className="p-3 sm:p-6 md:p-8 lg:p-12 max-w-4xl mx-auto" style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.4', color: 'black' }}>
            
            {/* Document Header */}
            <div className="text-center border-b-2 border-black pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="flex flex-col items-center justify-center mb-2 gap-1 sm:gap-2">
                <img src="/ongc_logo.png" alt="ONGC Logo" className="h-8 xs:h-10 sm:h-12 md:h-16 w-auto" />
                <div className="text-center">
                  <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold mb-1 tracking-wide leading-tight">OIL AND NATURAL GAS CORPORATION</h1>
                  <h2 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-gray-800 leading-tight">OPERATION GROUP MEHASANA ASSET</h2>
                </div>
              </div>
              <div className="text-center mt-2 sm:mt-3">
                <p className="font-semibold text-xs xs:text-sm sm:text-base">Work Order no- {data.workOrderNo}</p>
              </div>
            </div>

            {/* Work Order Section */}
            <div className="mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold uppercase tracking-wide leading-tight">WORK ORDER AND COMPLETION CERTIFICATION</h3>
                <p className="text-xs font-medium mt-1">(Leakage Repairs)</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
                  <div className="text-xs xs:text-sm sm:text-base">
                    <span className="font-semibold">Name of Installation:</span>
                    <span className="ml-1 font-bold break-words">{data.installationName}</span>
                  </div>
                  <div className="text-xs xs:text-sm sm:text-base">
                    <span className="font-semibold">DATE:</span>
                    <span className="ml-1 font-bold">{data.date}</span>
                  </div>
                </div>
                <div className="text-center border-t border-b border-black py-1 sm:py-2">
                  <p className="font-bold text-sm xs:text-base sm:text-lg">(WORK ORDER)</p>
                </div>
              </div>

              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Kindly attend following:</span> 
                  <span className="font-bold ml-1 break-words">{data.workDescription}</span>
                </p>
                
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Details of line:</span> 
                  <span className="ml-1 break-words">{data.workDetails}</span>
                </p>
                
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Name of the land owner:</span>
                  <span className="ml-1 font-bold">{data.landOwner}</span>
                </p>
                
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Leakage Information Report No.:</span>
                  <span className="ml-1">{data.leakageReportNo || 'N/A'}</span>
                </p>
                
                <p className="text-center font-semibold border-t border-b border-black py-1 sm:py-2 text-xs xs:text-sm sm:text-base">
                  Material Supplied by the Contractor
                </p>
              </div>

              {/* Materials Table */}
              <div className="mb-6 sm:mb-8 page-break-avoid">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full border-collapse border-2 border-black min-w-[300px]">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="py-1 xs:py-2 sm:py-3 px-1 xs:px-2 sm:px-4 text-left font-bold border-r border-black text-xs xs:text-sm sm:text-base">DESCRIPTION</th>
                        <th className="py-1 xs:py-2 sm:py-3 px-1 xs:px-2 sm:px-4 text-center font-bold border-r border-black text-xs xs:text-sm sm:text-base">QTY</th>
                        <th className="py-1 xs:py-2 sm:py-3 px-1 xs:px-2 sm:px-4 text-center font-bold text-xs xs:text-sm sm:text-base">UNIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.materials.map((material, index) => (
                        <tr key={index} className="border-b border-black">
                          <td className="py-1 xs:py-2 sm:py-3 px-1 xs:px-2 sm:px-4 text-left border-r border-black text-xs xs:text-sm sm:text-base break-words">{material.description}</td>
                          <td className="py-1 xs:py-2 sm:py-3 px-1 xs:px-2 sm:px-4 text-center font-bold border-r border-black text-xs xs:text-sm sm:text-base">{material.quantity}</td>
                          <td className="py-1 xs:py-2 sm:py-3 px-1 xs:px-2 sm:px-4 text-center font-semibold text-xs xs:text-sm sm:text-base">{material.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-right mb-4 sm:mb-6 pt-4 sm:pt-6">
                <p className="font-semibold mb-2 text-xs xs:text-sm sm:text-base">Signature of instt I/C</p>
                <div className="ml-auto border-b-2 border-black w-24 xs:w-32 sm:w-48"></div>
              </div>
            </div>

            {/* Completion Certificate Section */}
            <div className="border-t-2 border-black pt-8 page-break-avoid">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-sm xs:text-base sm:text-lg font-bold tracking-wide uppercase">COMPLETION CERTIFICATE</h3>
              </div>
              
              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Certified that the following:</span>
                  <span className="font-bold ml-1 break-words">{data.workDescription}</span>
                </p>
                
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Details of Repair:</span>
                  <span className="ml-1 break-words">{data.workDetails}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                    <span className="font-semibold">Clamping:</span>
                    <span className="ml-1">{data.clamping || 'N/A'}</span>
                  </p>
                  <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                    <span className="font-semibold">Length pipe Changed:</span>
                    <span className="ml-1">{data.lengthPipeChanged || 'N/A'}</span>
                  </p>
                </div>

                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Jobs Done: -</span>
                  <span className="ml-1 font-bold">{data.jobType}</span>
                </p>

                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Name of the Agency:</span>
                  <span className="ml-1 font-bold break-words">{data.agencyName}</span>
                </p>

                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Job taken on:</span>
                  <span className="ml-1 font-bold">at {data.date} hours {data.jobTakenTime}</span>
                </p>
                
                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Job completed on:</span>
                  <span className="ml-1 font-bold">at {data.date} hours {data.jobCompletedTime}</span>
                </p>

                <p className="text-xs xs:text-sm sm:text-base leading-relaxed">
                  <span className="font-semibold">Line Retrieved and ope:</span>
                  <span className="ml-1">at hours {data.lineRetrieved || ''}</span>
                </p>
              </div>

              {/* Signature Section */}
              <div className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 signature-section page-break-avoid">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-16">
                  <div className="text-center">
                    <p className="font-bold text-sm xs:text-base sm:text-lg mb-1 sm:mb-2">Signature of C & M</p>
                    <p className="font-medium mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base">With Date:</p>
                    <div className="mt-6 xs:mt-8 sm:mt-12 border-b-2 border-black w-full"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm xs:text-base sm:text-lg mb-1 sm:mb-2">Signature of Instt</p>
                    <p className="font-medium mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base">With Date:</p>
                    <div className="mt-6 xs:mt-8 sm:mt-12 border-b-2 border-black w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
