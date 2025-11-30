'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { FileText, Plus, Trash2, Download, Eye, Building2 } from 'lucide-react';
import { generatePDF, generateDOC } from './lib/pdf-generator';

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

// Navbar Component
function Navbar() {

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg">
                <Building2 className="h-8 w-8 text-gray-700" />
              </div>
              <div className="text-white">
                <h1 className="font-bold text-lg">ONGC Mehasana</h1>
                <p className="text-xs text-gray-100">Work Order Management</p>
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
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="h-6 w-6 text-gray-400" />
              <span className="font-bold text-lg">ONGC Mehasana</span>
            </div>
            <p className="text-gray-300 text-sm">
              Digital Work Order Management System for Oil and Natural Gas Corporation, Mehasana Asset Operations.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Dynamic Form Builder</li>
              <li>• Live Document Preview</li>
              <li>• PDF & DOC Export</li>
              <li>• Professional Templates</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 text-sm">
              Operation Group Mehasana Asset<br />
              Oil and Natural Gas Corporation<br />
              Gujarat, India
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; 2025 Oil and Natural Gas Corporation. All rights reserved.</p>
            <p>
              Powered by{' '}
              <a 
                href="https://kailashpro.co.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
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

export default function Home() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<WorkOrderData | null>(null);

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

  const handleDownloadPDF = () => {
    if (formData) {
      generatePDF(formData);
    }
  };

  const handleDownloadDOC = () => {
    if (formData) {
      generateDOC(formData);
    }
  };

  const handleBackToEdit = () => {
    setIsPreviewMode(false);
  };

  if (isPreviewMode && formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <DocumentPreview data={formData} onBack={handleBackToEdit} onDownloadPDF={handleDownloadPDF} onDownloadDOC={handleDownloadDOC} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <FileText className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            OIL AND NATURAL GAS CORPORATION
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-blue-100">
            OPERATION GROUP MEHASANA ASSET
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Digital Work Order & Completion Certificate Generator
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">📋 Dynamic Forms</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">👁️ Live Preview</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">📄 PDF & DOC Export</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">✅ Professional Format</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Create New Work Order</h3>
                  <p className="text-gray-600">Fill in the details below to generate your work order document</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <input
                    type="text"
                    {...register('installationName')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Santhal Main"
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
                  <input
                    type="text"
                    {...register('agencyName')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., NAVBHARAT CONSTRUCTION"
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
                    <input
                      type="text"
                      {...register('workDescription')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="e.g., SN#15 WATER INJECTION HEADER MODIFICATION"
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
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-[18px] h-[18px]" />
                    Add Material
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Material Description *
                        </label>
                        <input
                          type="text"
                          {...register(`materials.${index}.description`)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                          placeholder="e.g., 3'' 3LPE PIPE"
                        />
                        {errors.materials?.[index]?.description && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.materials[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="text"
                          {...register(`materials.${index}.quantity`)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                          placeholder="28.800"
                        />
                        {errors.materials?.[index]?.quantity && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.materials[index]?.quantity?.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Unit *
                          </label>
                          <select
                            {...register(`materials.${index}.unit`)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                          >
                            <option value="">Select Unit</option>
                            <option value="NOS">NOS</option>
                            <option value="MTR">MTR</option>
                            <option value="HRS">HRS</option>
                            <option value="SET">SET</option>
                            <option value="BAGS">BAGS</option>
                            <option value="MTR CUBE">MTR CUBE</option>
                          </select>
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
                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <select
                      {...register('jobType')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white text-gray-900"
                    >
                      <option value="U/G JOB">U/G JOB</option>
                      <option value="O/H JOB">O/H JOB</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Fields Section */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  Optional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Eye className="w-6 h-6" />
                  Preview Document
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Document Preview Component
function DocumentPreview({ data, onBack, onDownloadPDF, onDownloadDOC }: { 
  data: WorkOrderData; 
  onBack: () => void; 
  onDownloadPDF: () => void;
  onDownloadDOC: () => void; 
}) {
  return (
    <div className="flex-1 py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ← Back to Edit
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={onDownloadDOC}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FileText className="w-5 h-5" />
              Download DOC
            </button>
          </div>
        </div>

        <div id="document-content" className="bg-white p-8 shadow-2xl rounded-2xl border border-gray-200">
          {/* Document Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-xl font-bold mb-2">OIL AND NATURAL GAS CORPORATION</h1>
            <h2 className="text-lg font-semibold mb-2">OPERATION GROUP MEHASANA ASSET</h2>
            <div className="flex justify-between items-center">
              <span>Work Order no- {data.workOrderNo}</span>
            </div>
          </div>

          {/* Work Order Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">WORK ORDER AND COMPLETION CERTIFICATION</h3>
              <p className="text-sm">(Leakage Repairs)</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span>NAME OF INSTALLATION: {data.installationName}</span>
                <span>DATE: {data.date}</span>
              </div>
              <p className="font-bold">(WORK ORDER)</p>
            </div>

            <div className="mb-4">
              <p>Kindly attend following: {data.workDescription}</p>
              <p>Details of line: {data.workDetails}</p>
              <div className="flex justify-between">
                <span>Name of the land owner:</span>
                <span>{data.landOwner}</span>
              </div>
              <p>Leakage Information Report No. {data.leakageReportNo || ''}</p>
              <p>Material Supplied by the Contractor.</p>
            </div>

            {/* Materials Table */}
            <div className="mb-6">
              <table className="w-full">
                <tbody>
                  {data.materials.map((material, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-1 pr-4 text-left">{material.description}</td>
                      <td className="py-1 px-4 text-right">{material.quantity}</td>
                      <td className="py-1 pl-4 text-left">{material.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right mb-8">
              <p>Signature of instt I/C</p>
            </div>
          </div>

          {/* Completion Certificate Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">COMPLETION CERTIFICATE</h3>
            
            <div className="mb-4">
              <p>Certified that the following: {data.workDescription}</p>
              <p>Details of Repair: {data.workDetails}</p>
              <p>Clamping: {data.clamping || ''}</p>
              <p>Length pipe Changed: {data.lengthPipeChanged || ''}</p>
              <p>Jobs Done: - {data.jobType}</p>
              <p>Name of the Agency: {data.agencyName}</p>
              <p>Job taken on: at {data.date} hours {data.jobTakenTime}</p>
              <p>Job completed on: at {data.date} hours {data.jobCompletedTime}</p>
              <p>Line Retrieved and ope: at hours {data.lineRetrieved || ''}</p>
            </div>

            <div className="flex justify-between mt-8">
              <div>
                <p>Signature of C & M</p>
                <p>With Date:</p>
              </div>
              <div>
                <p>Signature of Instt</p>
                <p>With Date:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
