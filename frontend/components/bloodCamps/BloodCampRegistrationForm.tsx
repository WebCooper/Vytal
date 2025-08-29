import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, FaPhone, FaUserMd, FaPills, 
  FaStickyNote, FaTimes, FaExclamationTriangle,
  FaCheckCircle, FaSpinner, FaInfoCircle
} from 'react-icons/fa';
import { MdBloodtype, MdLocationOn, MdDateRange } from 'react-icons/md';
import { BloodCamp, BloodCampRegistrationCreate } from '@/components/types';
import { 
  checkEligibility,
  registerForBloodCamp
} from '@/lib/bloodCampsApi';
import { toast } from 'react-hot-toast';

interface BloodCampRegistrationFormProps {
  selectedCamp: BloodCamp;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

// Enhanced error handling interface
interface RegistrationError {
  type: 'already_registered' | 'eligibility' | 'validation' | 'network' | 'unknown';
  message: string;
  details?: string;
}
interface ErrorData {
  error?: string;
  message?: string;
  details?: string;
}
const BloodCampRegistrationForm: React.FC<BloodCampRegistrationFormProps> = ({
  selectedCamp,
  onClose,
  onSuccess,
  userId
}) => {
  const [formData, setFormData] = useState<BloodCampRegistrationCreate>({
    camp_id: selectedCamp.id,
    blood_type: '',
    contact_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: '',
    medications: '',
    notes: ''
  });

  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    reason?: string;
    next_eligible_date?: string;
    last_donation_date?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationError, setRegistrationError] = useState<RegistrationError | null>(null);

  // Check eligibility on component mount
  useEffect(() => {
    const checkDonorEligibility = async () => {
      // Add validation to ensure userId is valid before making the API call
      if (!userId || userId === 0) {
        console.error('Invalid userId:', userId);
        toast.error('User ID is required for eligibility check');
        setEligibility({ eligible: false, reason: 'Invalid user ID' });
        return;
      }

      setCheckingEligibility(true);
      try {
        console.log('Checking eligibility for userId:', userId); // Debug log
        const eligibilityData = await checkEligibility(userId);
        setEligibility(eligibilityData);
      } catch (error) {
        console.error('Error checking eligibility:', error);
        toast.error('Failed to check donation eligibility');
        // Set a default eligibility state to prevent blocking the form
        setEligibility({ 
          eligible: true, 
          reason: 'Unable to verify eligibility. Please proceed with caution.' 
        });
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkDonorEligibility();
  }, [userId]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (field: keyof BloodCampRegistrationCreate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous registration errors when user starts typing
    if (registrationError) {
      setRegistrationError(null);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.blood_type && formData.contact_phone);
      case 2:
        return !!(formData.emergency_contact_name && formData.emergency_contact_phone);
      case 3:
        return true; // Medical info is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Enhanced error parsing function
const parseRegistrationError = (error: unknown): RegistrationError => {
  console.log('Registration error details:', error);

  let errorData: ErrorData | null = null;
  let newErrorData: string | null = null;

  // Safely check error structure
  if (error && typeof error === 'object') {
    // Handle error.response.data
    if (
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object'
    ) {
      errorData = error.response.data as ErrorData;
      newErrorData = errorData.message ?? 'Something went wrong';
    }
    // Handle error.data
    else if ('data' in error && error.data && typeof error.data === 'object') {
      errorData = error.data as ErrorData;
      newErrorData = (error.data as ErrorData).message ?? 'Something went wrong';
    }
    // Handle error with error/message/details properties
    else if ('error' in error || 'message' in error || 'details' in error) {
      const errorObj = error as ErrorData;
      errorData = {
        error: typeof errorObj.error === 'string' ? errorObj.error : undefined,
        message: typeof errorObj.message === 'string' ? errorObj.message : undefined,
        details: typeof errorObj.details === 'string' ? errorObj.details : undefined,
      };
      newErrorData = errorData.message ?? 'Something went wrong';
    }
  }

  console.log('Parsed error data:', errorData);

  // Handle already registered error
  if (errorData?.error) {
    const errorMessage = errorData.error.toLowerCase();
    if (errorMessage.includes('already registered')) {
      return {
        type: 'already_registered',
        message: 'You are already registered for this blood camp',
        details: 'It looks like you have already registered for this blood camp. You can view your existing registrations in the "My Registrations" section.',
      };
    }

    return {
      type: 'validation',
      message: errorData.error,
      details: errorData.details || 'Please check your information and try again.',
    };
  }

  // Handle network or other errors
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const errorMessage = (error as { message: string }).message.toLowerCase();
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection error',
        details: 'Please check your internet connection and try again.',
      };
    }

    if (errorMessage.includes('already registered')) {
      return {
        type: 'already_registered',
        message: 'You are already registered for this blood camp',
        details: 'It looks like you have already registered for this blood camp. You can view your existing registrations in the "My Registrations" section.',
      };
    }
  }

  // Check if error is a string
  if (typeof error === 'string' && error.toLowerCase().includes('already registered')) {
    return {
      type: 'already_registered',
      message: 'You are already registered for this blood camp',
      details: 'It looks like you have already registered for this blood camp. You can view your existing registrations in the "My Registrations" section.',
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: 'Registration failed',
    details: newErrorData || 'An unexpected error occurred.',
  };
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setRegistrationError(null);
    
    // Validate userId before submission
    if (!userId || userId === 0) {
      toast.error('Invalid user ID. Please try logging in again.');
      return;
    }

    if (!eligibility?.eligible) {
      toast.error('You are not eligible to donate at this time');
      return;
    }

    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting registration with data:', formData);
      const response = await registerForBloodCamp(formData);
      console.log('Registration successful:', response);
      toast.success('Successfully registered for blood camp!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Registration error caught:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error string:', String(error));
      
      // Simple check for already registered error
      const errorString = JSON.stringify(error).toLowerCase();
      console.log('Error as string:', errorString);
      
      let parsedError: RegistrationError;
      
      if (errorString.includes('already registered')) {
        console.log('Detected already registered error');
        parsedError = {
          type: 'already_registered',
          message: 'You are already registered for this blood camp',
          details: 'It looks like you have already registered for this blood camp. You can view your existing registrations in the "My Registrations" section.'
        };
      } else {
        parsedError = parseRegistrationError(error);
      }
      
      console.log('Final parsed error:', parsedError);
      setRegistrationError(parsedError);
      
      // Also show toast for immediate feedback
      toast.error(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

  // Error Alert Component
  const ErrorAlert = ({ error }: { error: RegistrationError }) => {
    const getErrorIcon = () => {
      switch (error.type) {
        case 'already_registered':
          return <FaInfoCircle className="text-blue-500 text-xl" />;
        case 'eligibility':
        case 'validation':
          return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
        case 'network':
        case 'unknown':
          return <FaExclamationTriangle className="text-red-500 text-xl" />;
        default:
          return <FaExclamationTriangle className="text-red-500 text-xl" />;
      }
    };

    const getErrorColor = () => {
      switch (error.type) {
        case 'already_registered':
          return 'bg-blue-50 border-blue-200';
        case 'eligibility':
        case 'validation':
          return 'bg-yellow-50 border-yellow-200';
        case 'network':
        case 'unknown':
          return 'bg-red-50 border-red-200';
        default:
          return 'bg-red-50 border-red-200';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${getErrorColor()} mb-4`}
      >
        <div className="flex items-start space-x-3">
          {getErrorIcon()}
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 mb-1">{error.message}</h4>
            {error.details && (
              <p className="text-sm text-gray-600">{error.details}</p>
            )}
            {error.type === 'already_registered' && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    onClose();
                    // You can add navigation to registrations page here
                    // For example: router.push('/dashboard/registrations');
                  }}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
                >
                  View My Registrations
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setRegistrationError(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h3>
            
            {/* Blood Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdBloodtype className="inline mr-2" />
                Blood Type *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('blood_type', type)}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                      formData.blood_type === type
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Last Donation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdDateRange className="inline mr-2" />
                Last Donation Date (if any)
              </label>
              <input
                type="date"
                value={formData.last_donation_date || ''}
                onChange={(e) => handleInputChange('last_donation_date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact</h3>
            
            {/* Emergency Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Emergency Contact Name *
              </label>
              <input
                type="text"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                placeholder="Enter emergency contact name"
                required
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.emergency_contact_phone || ''}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                placeholder="Enter emergency contact phone"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Medical Information</h3>
            
            {/* Medical Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUserMd className="inline mr-2" />
                Medical Conditions
              </label>
              <textarea
                value={formData.medical_conditions || ''}
                onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                placeholder="List any medical conditions (optional)"
                rows={3}
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPills className="inline mr-2" />
                Current Medications
              </label>
              <textarea
                value={formData.medications || ''}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                placeholder="List any current medications (optional)"
                rows={3}
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaStickyNote className="inline mr-2" />
                Additional Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                placeholder="Any additional information (optional)"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while checking eligibility
  if (checkingEligibility) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking donation eligibility...</p>
        </div>
      </div>
    );
  }

  // Show error state if userId is invalid
  if (!userId || userId === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-md w-full p-8 text-center"
        >
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">
            Unable to verify your identity. Please try logging in again.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Register for Blood Camp</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-emerald-600 text-xl"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Camp Info */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-800">{selectedCamp.name}</h3>
            <div className="flex items-center text-sm text-emerald-600 mt-1">
              <MdLocationOn className="mr-1" />
              <span>{selectedCamp.location}</span>
              <span className="mx-2">•</span>
              <MdDateRange className="mr-1" />
              <span>{new Date(selectedCamp.date).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{selectedCamp.time}</span>
            </div>
          </div>

          {/* Eligibility Status */}
          {eligibility && (
            <div className={`mt-4 p-4 rounded-lg border ${
              eligibility.eligible
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {eligibility.eligible ? (
                  <FaCheckCircle className="text-green-600 mr-2" />
                ) : (
                  <FaExclamationTriangle className="text-red-600 mr-2" />
                )}
                <span className={`font-medium ${
                  eligibility.eligible ? 'text-green-800' : 'text-red-800'
                }`}>
                  {eligibility.eligible ? 'Eligible to Donate' : 'Not Eligible'}
                </span>
              </div>
              {eligibility.reason && (
                <p className={`text-sm mt-1 ${
                  eligibility.eligible ? 'text-green-700' : 'text-red-700'
                }`}>
                  {eligibility.reason}
                </p>
              )}
              {eligibility.next_eligible_date && (
                <p className="text-sm text-gray-600 mt-1">
                  Next eligible date: {new Date(eligibility.next_eligible_date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-emerald-600 text-white'
                    : step < currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? <FaCheckCircle /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {eligibility?.eligible ? (
            <div>
              {/* Show registration error if exists */}
              {registrationError && <ErrorAlert error={registrationError} />}
              
              {renderStep()}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Register</h3>
              <p className="text-gray-600">
                You are currently not eligible to donate blood. Please check back after your next eligible date.
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        {eligibility?.eligible && (
          <div className="p-6 border-t border-gray-200 flex justify-between bg-white rounded-b-3xl">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={!validateStep(currentStep) || loading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading && <FaSpinner className="animate-spin mr-2" />}
                Register
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BloodCampRegistrationForm;