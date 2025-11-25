import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  Download,
  Check,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from '../utils/toast';
import { dealValidityAPI } from '../utils/api';
import CommonLayout from '../components/layout/CommonLayout';

const DealValidityPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL parameters
  const dealId = searchParams.get('deal_id');
  const customerId = searchParams.get('customer_id');
  const businessId = searchParams.get('business_id');
  const groupId = searchParams.get('group_id');
  const claim_id = searchParams.get('claim_id');
  
  // State
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (claim_id && dealId && customerId && businessId && groupId) {
      verifyDeal();
    } else {
      setError('Missing required parameters');
      setLoading(false);
    }
  }, [claim_id, dealId, customerId, businessId, groupId]);

  const verifyDeal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Log the parameters being sent
      console.log('Verifying deal with parameters:', {
        claim_id,
        dealId,
        customerId,
        businessId,
        groupId
      });
      
      const data = await dealValidityAPI.verifyDeal(claim_id, dealId, customerId, businessId, groupId);
      
      if (data.success) {
        setVerificationData(data.data);
      } else {
        setError(data.message || 'Failed to verify deal');
        toast.error(data.message || 'Failed to verify deal');
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please check your connection.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markDealAsUsed = async () => {
    if (!verificationData?.claim?.claim_id) return;
    
    try {
      setActionLoading(true);
      
      const data = await dealValidityAPI.markDealAsUsed(
        dealId, 
        customerId, 
        businessId, 
        verificationData.claim.claim_id
      );
      
      if (data.success) {
        toast.success('Deal marked as used successfully!');
        // Refresh verification data
        await verifyDeal();
      } else {
        toast.error(data.message || 'Failed to mark deal as used');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectDeal = async () => {
    if (!verificationData?.claim?.claim_id) return;
    
    try {
      setActionLoading(true);
      
      const data = await dealValidityAPI.rejectDeal(
        dealId,
        customerId,
        businessId,
        verificationData.claim.claim_id,
        'Invalid QR code or deal'
      );
      
      if (data.success) {
        toast.success('Deal rejected successfully');
        navigate('/');
      } else {
        toast.error(data.message || 'Failed to reject deal');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'expired':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'used':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'invalid':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'used':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'invalid':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price) => `RM ${price.toFixed(2)}`;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <CommonLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Deal...</h2>
            <p className="text-gray-600">Please wait while we verify the deal details</p>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (error) {
    return (
      <CommonLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={verifyDeal}
                className="w-full bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Back to Deals
              </button>
            </div>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (!verificationData) {
    return (
      <CommonLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-600">Unable to load verification data</p>
          </div>
        </div>
      </CommonLayout>
    );
  }

  const { deal, customer, business, claim, is_valid, status } = verificationData;

  return (
    <CommonLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Deal Verification</h1>
                <p className="text-gray-600">Verify and redeem customer deal</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="font-medium capitalize">{status}</span>
              </div>
            </div>
            
            {/* QR Code */}
            {claim?.qr_code && (
              <div className="text-center">
                <img 
                  src={claim.qr_code} 
                  alt="Deal QR Code" 
                  className="w-32 h-32 mx-auto border-2 border-gray-200 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">Scanned QR Code</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Deal Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{deal.deal_name}</h3>
                  {deal.deal_description && (
                    <p className="text-gray-600 text-sm mt-1">{deal.deal_description}</p>
                  )}
                </div>

                {/* Deal Items */}
                {deal.deal_items && deal.deal_items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items Included:</h4>
                    <div className="space-y-2">
                      {deal.deal_items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatPrice(item.product_price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Regular Price:</span>
                      <span className="line-through text-gray-500">{formatPrice(deal.original_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deal Total:</span>
                      <span className="font-bold text-primary text-lg">{formatPrice(deal.deal_total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>You Save:</span>
                      <span className="font-medium">{formatPrice(deal.original_total - deal.deal_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Valid: {formatDate(deal.start_date)} - {formatDate(deal.end_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* <img
                    src={customer.profile_image || 'https://via.placeholder.com/60x60?text=User'}
                    alt={customer.name}
                    className="w-15 h-15 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60x60?text=User';
                    }}
                  /> */}
                  <div>
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{customer.name}</span>
                    </div>
                    {/* <h3 className="font-medium text-gray-900">{customer.name}</h3> */}
                    {/* <p className="text-sm text-gray-600">Customer ID: {customer.customer_id}</p> */}
                  </div>
                </div>

                <div className="space-y-3">
                  {customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{customer.email}</span>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{customer.phone}</span>
                    </div>
                  )}
                </div>

                {/* Claim Details */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Claim Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Claimed At:</span>
                      <span>{formatDate(claim.claimed_at)}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${claim.is_used ? 'text-blue-600' : 'text-green-600'}`}>
                        {claim.is_used ? 'Used' : 'Active'}
                      </span>
                    </div> */}
                    {claim.used_at && (
                      <div className="flex justify-between">
                        <span>Used At:</span>
                        <span>{formatDate(claim.used_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Business Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{business.company_name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {business.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{business.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* <div className="text-sm text-gray-600">
                <div className="space-y-1">
                  <div><strong>Business ID:</strong> {business.business_id}</div>
                  <div><strong>Group ID:</strong> {groupId}</div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {status === 'active' && !claim.is_used && (
                <button
                  onClick={markDealAsUsed}
                  disabled={actionLoading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Mark as Used
                </button>
              )}
              
              {/* {status === 'active' && !claim.is_used && (
                <button
                  onClick={rejectDeal}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject Deal
                </button>
              )} */}
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Back to Deals
              </button>
            </div>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default DealValidityPage;
