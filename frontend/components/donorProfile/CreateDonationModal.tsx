import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { createDonation, DonationCreate } from '@/lib/donationApi';

interface CreateDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateDonationModal: React.FC<CreateDonationModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState<DonationCreate>({
        donation_type: 'blood',
        donation_date: new Date().toISOString().split('T')[0],
        volume_ml: 450,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const donationTypes = [
        { value: 'blood', label: 'Blood Donation', color: 'red' },
        { value: 'organs', label: 'Organ Donation', color: 'purple' },
        { value: 'medicines', label: 'Medicine Donation', color: 'green' },
        { value: 'supplies', label: 'Medical Supplies', color: 'blue' },
        { value: 'fundraiser', label: 'Fundraiser', color: 'yellow' }
    ];

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Ensure all required and optional fields are included with explicit null values
            const submissionData = {
                donation_type: formData.donation_type,
                donation_date: formData.donation_date,
                recipient_id: formData.recipient_id || null,
                post_id: formData.post_id || null,
                amount: formData.donation_type === 'fundraiser' ? (formData.amount || null) : null,
                quantity: formData.quantity || null,
                description: formData.description || null,
                location: formData.location || null,
                notes: formData.notes || null,
                // Blood donation specific fields
                blood_type: formData.blood_type || null,
                volume_ml: formData.volume_ml || null,
                hemoglobin_level: formData.hemoglobin_level || null,
                donation_center: formData.donation_center || null
            };

            await createDonation(submissionData);
            onSuccess?.();
            onClose();
            setFormData({
                donation_type: 'blood',
                donation_date: new Date().toISOString().split('T')[0],
                volume_ml: 450,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log donation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof DonationCreate, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-2xl font-bold text-gray-800">Log Donation</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes className="text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Donation Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Donation Type *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {donationTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleChange('donation_type', type.value)}
                                        className={`p-3 rounded-lg border-2 transition-all ${formData.donation_type === type.value
                                            ? `border-${type.color}-500 bg-${type.color}-50`
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Blood Type (if blood donation) */}
                        {formData.donation_type === 'blood' && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Blood Type *
                                    </label>
                                    <select
                                        value={formData.blood_type || ''}
                                        onChange={(e) => handleChange('blood_type', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 mb-2"
                                        required
                                    >
                                        <option value="">Select blood type</option>
                                        {bloodTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Volume (ml)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.volume_ml || 450}
                                        onChange={(e) => handleChange('volume_ml', parseInt(e.target.value) || 450)}
                                        placeholder="450"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 mb-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Amount (if fundraiser) */}
                        {formData.donation_type === 'fundraiser' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount || ''}
                                    onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 mb-2"
                                    required
                                />
                            </div>
                        )}

                        {/* Quantity (for non-blood, non-fundraiser) */}
                        {formData.donation_type !== 'blood' && formData.donation_type !== 'fundraiser' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="text"
                                    value={formData.quantity || ''}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                    placeholder="e.g., 10 units, 5kg, etc."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 mb-2"
                                />
                            </div>
                        )}

                        {/* Donation Date */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Donation Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.donation_date}
                                    onChange={(e) => handleChange('donation_date', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    placeholder="Hospital, clinic, or donation center"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                placeholder="Additional details about the donation..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                            />
                        </div>

                        {/* Blood donation specific fields */}
                        {formData.donation_type === 'blood' && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Donation Center
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.donation_center || ''}
                                        onChange={(e) => handleChange('donation_center', e.target.value)}
                                        placeholder="Name of blood bank or hospital"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 mb-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hemoglobin Level (g/dL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.hemoglobin_level || ''}
                                        onChange={(e) => handleChange('hemoglobin_level', parseFloat(e.target.value))}
                                        placeholder="12.5"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 mb-2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={2}
                                placeholder="Personal notes or reminders..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 mb-2"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Logging...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-2" />
                                        Log Donation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateDonationModal;