import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, Calendar, CreditCard } from 'lucide-react';
import WarehouseMap from '../../components/Map/WarehouseMap';
import { ecommercePlatforms, timeSlots } from '../../data/mockData';
import apiClient from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { omitErrorKey } from '../../lib/utils';

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const ORDER_NUMBER_PATTERN = /^[A-Za-z0-9-]{6,30}$/;
const PINCODE_PATTERN = /^[0-9]{6}$/;

// initialFormData seeds the form with blank values.
const initialFormData = {
  orderNumber: '',
  platform: '',
  productDescription: '',
  originalETA: '',
  warehouse: null,
  scheduledDeliveryDate: '',
  deliveryTimeSlot: '',
  destinationAddress: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    contactNumber: ''
  }
};

// calculateCharges returns the static price breakdown.
const calculateCharges = () => {
  const baseHandlingFee = 49;
  const storageFee = 20;
  const deliveryCharge = 60;
  const subtotal = baseHandlingFee + storageFee + deliveryCharge;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return {
    baseHandlingFee,
    storageFee,
    deliveryCharge,
    subtotal,
    gst,
    total
  };
};

// NewRequest guides consumers through submitting delivery requests.
const NewRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useAuth();

  // derive initial step from query ?step=schedule|payment|1..3
  const initialStep = useMemo(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'schedule') return 2;
    if (stepParam === 'payment') return 3;

    const numeric = Number.parseInt(stepParam ?? '1', 10);
    if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 3) return numeric;
    return 1;
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // clearError removes a specific validation message.
  const clearError = (key) => omitErrorKey(setErrors, key);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        destinationAddress: {
          ...prev.destinationAddress,
          [addressField]: value
        }
      }));
      clearError(`address.${addressField}`);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      clearError(name);
    }
  };

  const clearPaymentError = () => clearError('paymentMethod');

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    clearPaymentError();
  };

  const resetFileState = () => {
    setSelectedFile(null);
    setSelectedFileData(null);
    setIsProcessingReceipt(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetFileState();
      clearError('file');
      return;
    }

    resetFileState();
    if (file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, file: 'Only PDF files are allowed' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      setErrors((prev) => ({ ...prev, file: 'File size must be less than 5MB' }));
      event.target.value = '';
      return;
    }

    setIsProcessingReceipt(true);
    const reader = new FileReader();

    reader.onload = () => {
      const { result } = reader;
      let base64Data = '';

      if (typeof result === 'string') {
        const [, extracted = result] = result.split(',');
        base64Data = extracted.trim();
      }

      if (!base64Data) {
        setErrors((prev) => ({ ...prev, file: 'Failed to process the selected file. Please try again.' }));
        resetFileState();
        event.target.value = '';
        return;
      }

      setSelectedFile(file);
      setSelectedFileData(base64Data);
      clearError('file');
      setIsProcessingReceipt(false);
    };

    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, file: 'Failed to read the selected file. Please try again.' }));
      resetFileState();
      event.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  // validateStep1 ensures order metadata is correct.
  const validateStep1 = () => {
    const newErrors = {};

    const trimmedOrderNumber = formData.orderNumber.trim();
    const trimmedDescription = formData.productDescription.trim();

    if (!trimmedOrderNumber) {
      newErrors.orderNumber = 'Order number is required';
    } else if (!ORDER_NUMBER_PATTERN.test(trimmedOrderNumber)) {
      newErrors.orderNumber = 'Order number must be 6-30 characters (letters, numbers, hyphen)';
    }

    if (!formData.platform) {
      newErrors.platform = 'Platform selection is required';
    }

    if (!trimmedDescription) {
      newErrors.productDescription = 'Product description is required';
    } else if (trimmedDescription.length < 10) {
      newErrors.productDescription = 'Product description must be at least 10 characters';
    }

    if (!formData.originalETA) {
      newErrors.originalETA = 'Original ETA is required';
    } else if (Number.isNaN(new Date(formData.originalETA).getTime())) {
      newErrors.originalETA = 'Please provide a valid date';
    }

    if (!formData.warehouse) {
      newErrors.warehouse = 'Warehouse selection is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Receipt PDF is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // validateStep2 checks delivery scheduling and address fields.
  const validateStep2 = () => {
    const newErrors = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { destinationAddress } = formData;
    const scheduledDateValue = formData.scheduledDeliveryDate;

    if (!scheduledDateValue) {
      newErrors.scheduledDeliveryDate = 'Delivery date is required';
    } else {
      const parsedDate = new Date(scheduledDateValue);
      if (Number.isNaN(parsedDate.getTime())) {
        newErrors.scheduledDeliveryDate = 'Please select a valid delivery date';
      } else {
        parsedDate.setHours(0, 0, 0, 0);
        if (parsedDate < today) {
          newErrors.scheduledDeliveryDate = 'Delivery date cannot be in the past';
        }
      }
    }

    if (!formData.deliveryTimeSlot) {
      newErrors.deliveryTimeSlot = 'Time slot is required';
    } else if (!timeSlots.includes(formData.deliveryTimeSlot)) {
      newErrors.deliveryTimeSlot = 'Please select a valid time slot';
    }

    const line1 = destinationAddress.line1.trim();
    if (!line1) {
      newErrors['address.line1'] = 'Address line 1 is required';
    } else if (line1.length < 5) {
      newErrors['address.line1'] = 'Address line 1 must be at least 5 characters';
    }

    const city = destinationAddress.city.trim();
    if (!city) {
      newErrors['address.city'] = 'City is required';
    } else if (city.length < 2) {
      newErrors['address.city'] = 'City must be at least 2 characters';
    }

    const state = destinationAddress.state.trim();
    if (!state) {
      newErrors['address.state'] = 'State is required';
    } else if (state.length < 2) {
      newErrors['address.state'] = 'State must be at least 2 characters';
    }

    const pincode = destinationAddress.pincode.trim();
    if (!pincode) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!PINCODE_PATTERN.test(pincode)) {
      newErrors['address.pincode'] = 'Enter a valid 6-digit pincode';
    }

    const contactNumber = destinationAddress.contactNumber.trim();
    const digitsOnly = contactNumber.replace(/\D/g, '');
    if (!contactNumber) {
      newErrors['address.contactNumber'] = 'Contact number is required';
    } else if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      newErrors['address.contactNumber'] = 'Enter a valid contact number (10-15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleNext advances the wizard when validation passes.
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setSubmitError(null);
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setSubmitError(null);
      setCurrentStep(3);
    }
  };

  const charges = useMemo(() => calculateCharges(), []);

  // validateStep3 ensures a payment method is chosen.
  const validateStep3 = () => {
    if (!selectedPaymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: 'Please select a payment method' }));
      return false;
    }

    clearPaymentError();
    return true;
  };

  // handleSubmit composes the payload and calls the API.
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!selectedFile) {
      setErrors((prev) => ({ ...prev, file: 'Receipt PDF is required' }));
      setSubmitError('Please upload your purchase receipt before submitting.');
      setCurrentStep(1);
      return;
    }

    if (isProcessingReceipt) {
      setSubmitError('Please wait for the receipt to finish processing before submitting.');
      setCurrentStep(1);
      return;
    }

    if (!selectedFileData) {
      setErrors((prev) => ({ ...prev, file: 'Receipt PDF could not be processed. Please upload again.' }));
      setSubmitError('Please re-upload your purchase receipt before submitting.');
      setCurrentStep(1);
      return;
    }

    const isScheduleValid = validateStep2();
    if (!isScheduleValid) {
      setCurrentStep(2);
      return;
    }

    const isPaymentValid = validateStep3();
    if (!isPaymentValid) {
      setCurrentStep(3);
      return;
    }

    if (!state.user?.id) {
      setSubmitError('You need to be logged in to create a delivery request.');
      return;
    }

    const cleanedContactNumber = formData.destinationAddress.contactNumber
      .replace(/\D/g, '')
      .trim();

    const normalisedAddress = {
      line1: formData.destinationAddress.line1.trim(),
      line2: formData.destinationAddress.line2.trim(),
      city: formData.destinationAddress.city.trim(),
      state: formData.destinationAddress.state.trim(),
      pincode: formData.destinationAddress.pincode.trim(),
      landmark: formData.destinationAddress.landmark.trim(),
      contactNumber: cleanedContactNumber
    };

    const receiptMetadata = {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type,
      uploadedAt: new Date().toISOString(),
      data: selectedFileData
    };

    const payload = {
      userId: state.user.id,
      orderNumber: formData.orderNumber.trim(),
      platform: formData.platform,
      productDescription: formData.productDescription.trim(),
      warehouseId: formData.warehouse?.id ?? null,
      originalETA: formData.originalETA,
      scheduledDeliveryDate: formData.scheduledDeliveryDate,
      deliveryTimeSlot: formData.deliveryTimeSlot,
      destinationAddress: normalisedAddress,
      receipt: receiptMetadata,
      paymentDetails: {
        baseHandlingFee: charges.baseHandlingFee,
        storageFee: charges.storageFee,
        deliveryCharge: charges.deliveryCharge,
        gst: Number(charges.gst.toFixed(2)),
        totalAmount: Number(charges.total.toFixed(2)),
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod
      }
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdRequest = await apiClient.post('/requests', payload);
      if (createdRequest?.id) {
        navigate(`/request/${createdRequest.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setSubmitError(error?.message || 'Unable to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // paymentOptions defines available payment methods.
  const paymentOptions = [
    { id: 'card', label: 'Credit/Debit Card' },
    { id: 'upi', label: 'UPI' },
    { id: 'netbanking', label: 'Net Banking' },
    { id: 'wallet', label: 'Wallet' }
  ];

  return (
    <div className="min-h-screen bg-burrow-background py-8 page-fade">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 page-fade">
          {/* Step indicator shows current wizard stage */}
          <div className="flex items-center justify-between fade-stagger">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-burrow-primary text-burrow-text-inverse shadow-sm shadow-burrow-border/40'
                      : 'bg-burrow-background text-burrow-text-muted border border-burrow-border'
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-burrow-primary' : 'text-burrow-text-muted'
                  }`}
                >
                  {step === 1 ? 'Order Details' : step === 2 ? 'Schedule Delivery' : 'Payment'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 ml-4 rounded-full ${
                    step < currentStep ? 'bg-burrow-primary' : 'bg-burrow-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="card p-6 page-fade">
            {/* Step 1 collects order and receipt info */}
            <div className="flex items-center mb-6">
              <Upload className="h-6 w-6 text-burrow-primary mr-2" />
              <h2 className="text-2xl font-bold text-burrow-text-primary">Order Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-stagger">
              <div className="space-y-6 fade-stagger">
                {/* Order number */}
                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    className={`input-field-plain ${
                      errors.orderNumber ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                    placeholder="e.g., AMZ123456789"
                  />
                  {errors.orderNumber && <p className="text-red-600 text-xs mt-1">{errors.orderNumber}</p>}
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    E-commerce Platform *
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className={`input-field-plain ${
                      errors.platform ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  >
                    <option value="">Select Platform</option>
                    {ecommercePlatforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                  {errors.platform && <p className="text-red-600 text-xs mt-1">{errors.platform}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    Product Description *
                  </label>
                  <textarea
                    name="productDescription"
                    value={formData.productDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className={`input-field-plain ${
                      errors.productDescription
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                        : ''
                    }`}
                    placeholder="Brief description of the product"
                  />
                  {errors.productDescription && (
                    <p className="text-red-600 text-xs mt-1">{errors.productDescription}</p>
                  )}
                </div>

                {/* Original ETA */}
                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    Original Delivery Date *
                  </label>
                  <input
                    type="date"
                    name="originalETA"
                    value={formData.originalETA}
                    onChange={handleInputChange}
                    className={`input-field-plain ${
                      errors.originalETA ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  />
                  {errors.originalETA && <p className="text-red-600 text-xs mt-1">{errors.originalETA}</p>}
                </div>

                {/* Receipt */}
                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    Upload Receipt (PDF only, max 5MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="input-field-plain cursor-pointer"
                  />
                  {isProcessingReceipt && (
                    <p className="text-burrow-text-muted text-sm mt-1">Processing receipt...</p>
                  )}
                  {selectedFile && !isProcessingReceipt && (
                    <p className="text-burrow-primary text-sm mt-1">✓ {selectedFile.name} selected</p>
                  )}
                  {errors.file && <p className="text-red-600 text-xs mt-1">{errors.file}</p>}
                </div>
              </div>

              {/* Map */}
              <div className="page-fade">
                <h3 className="text-lg font-medium text-burrow-text-primary mb-4">Select Warehouse</h3>
                <WarehouseMap
                  onWarehouseSelect={(warehouse) => setFormData((prev) => ({ ...prev, warehouse }))}
                  selectedWarehouseId={formData.warehouse?.id}
                />
                {errors.warehouse && <p className="text-red-600 text-xs mt-1">{errors.warehouse}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                className="btn-primary btn-md"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="card p-6 page-fade">
            {/* Step 2 schedules delivery and captures address */}
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-burrow-primary mr-2" />
              <h2 className="text-2xl font-bold text-burrow-text-primary">Schedule Delivery</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-stagger">
              {/* Left */}
              <div className="space-y-6 fade-stagger">
                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    Preferred Delivery Date *
                  </label>
                  <input
                    type="date"
                    name="scheduledDeliveryDate"
                    value={formData.scheduledDeliveryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`input-field-plain ${
                      errors.scheduledDeliveryDate
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                        : ''
                    }`}
                  />
                  {errors.scheduledDeliveryDate && (
                    <p className="text-red-600 text-xs mt-1">{errors.scheduledDeliveryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-burrow-text-secondary mb-2">
                    Time Slot *
                  </label>
                  <select
                    name="deliveryTimeSlot"
                    value={formData.deliveryTimeSlot}
                    onChange={handleInputChange}
                    className={`input-field-plain ${
                      errors.deliveryTimeSlot ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryTimeSlot && (
                    <p className="text-red-600 text-xs mt-1">{errors.deliveryTimeSlot}</p>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="space-y-6 fade-stagger">
                <h3 className="text-lg font-medium text-burrow-text-primary">Destination Address</h3>

                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="address.line1"
                    value={formData.destinationAddress.line1}
                    onChange={handleInputChange}
                    placeholder="Address Line 1 *"
                    className={`input-field-plain ${
                      errors['address.line1'] ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  />
                  {errors['address.line1'] && <p className="text-red-600 text-xs">{errors['address.line1']}</p>}

                  <input
                    type="text"
                    name="address.line2"
                    value={formData.destinationAddress.line2}
                    onChange={handleInputChange}
                    placeholder="Address Line 2"
                    className="input-field-plain"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="address.city"
                      value={formData.destinationAddress.city}
                      onChange={handleInputChange}
                      placeholder="City *"
                      className={`input-field-plain ${
                        errors['address.city'] ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                      }`}
                    />
                    <input
                      type="text"
                      name="address.state"
                      value={formData.destinationAddress.state}
                      onChange={handleInputChange}
                      placeholder="State *"
                      className={`input-field-plain ${
                        errors['address.state'] ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                      }`}
                    />
                  </div>
                  {errors['address.city'] && <p className="text-red-600 text-xs">{errors['address.city']}</p>}
                  {errors['address.state'] && <p className="text-red-600 text-xs">{errors['address.state']}</p>}

                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.destinationAddress.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode *"
                    className={`input-field-plain ${
                      errors['address.pincode'] ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                    }`}
                  />
                  {errors['address.pincode'] && (
                    <p className="text-red-600 text-xs">{errors['address.pincode']}</p>
                  )}

                  <input
                    type="text"
                    name="address.landmark"
                    value={formData.destinationAddress.landmark}
                    onChange={handleInputChange}
                    placeholder="Landmark"
                    className="input-field-plain"
                  />

                  <input
                    type="tel"
                    name="address.contactNumber"
                    value={formData.destinationAddress.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Contact Number *"
                    className={`input-field-plain ${
                      errors['address.contactNumber']
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                        : ''
                    }`}
                  />
                  {errors['address.contactNumber'] && (
                    <p className="text-red-600 text-xs">{errors['address.contactNumber']}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  setSubmitError(null);
                  setCurrentStep(1);
                }}
                className="btn-secondary btn-md"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="btn-primary btn-md"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="card p-6 page-fade">
            {/* Step 3 reviews charges and payment */}
            <div className="flex items-center mb-6">
              <CreditCard className="h-6 w-6 text-burrow-primary mr-2" />
              <h2 className="text-2xl font-bold text-burrow-text-primary">Payment Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-stagger">
              <div className="page-fade">
                <h3 className="text-lg font-medium text-burrow-text-primary mb-4">Service Charges</h3>
                <div className="bg-burrow-background rounded-xl p-4 space-y-3 fade-stagger">
                  <div className="flex justify-between">
                    <span className="text-burrow-text-secondary">Base Handling Fee</span>
                    <span className="font-medium">₹{charges.baseHandlingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-burrow-text-secondary">Storage Fee (2 extra days)</span>
                    <span className="font-medium">₹{charges.storageFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-burrow-text-secondary">Delivery Charge</span>
                    <span className="font-medium">₹{charges.deliveryCharge}</span>
                  </div>
                  <div className="border-t border-burrow-border/60 pt-3">
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">Subtotal</span>
                      <span className="font-medium">₹{charges.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-burrow-text-secondary">GST (18%)</span>
                      <span className="font-medium">₹{charges.gst.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t border-burrow-border/60 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-burrow-primary">₹{charges.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 fade-stagger">
                <h3 className="text-lg font-medium text-burrow-text-primary mb-4">Payment Method</h3>
                {paymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center rounded-xl border p-4 cursor-pointer transition-colors ${
                      selectedPaymentMethod === option.id
                        ? 'border-burrow-primary bg-burrow-primary/10 shadow-sm'
                        : 'border-burrow-border hover:border-burrow-primary/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      checked={selectedPaymentMethod === option.id}
                      onChange={() => handlePaymentMethodChange(option.id)}
                      className="text-burrow-primary focus:ring-burrow-primary"
                    />
                    <span className="ml-2 text-burrow-text-secondary">{option.label}</span>
                  </label>
                ))}
                {errors.paymentMethod && (
                  <p className="text-red-600 text-xs mt-2">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 page-fade">
                {submitError}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  setSubmitError(null);
                  setCurrentStep(2);
                }}
                className="btn-secondary btn-md"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`btn-primary btn-md px-8 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing...' : `Proceed to Pay ₹${charges.total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

</div>  
</div>   
);
};


export default NewRequest;

           



