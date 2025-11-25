import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, QrCode, Clock, CheckCircle } from 'lucide-react';

const QRCodeModal = ({ claimData, onClose }) => {
  const { t, i18n } = useTranslation();
  const formatPrice = (price) => `RM ${price.toFixed(2)}`;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ms' ? 'ms-MY' : 'en-GB';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadQRCode = () => {
    if (claimData?.qr_code) {
      const link = document.createElement('a');
      link.href = claimData.qr_code;
      link.download = `deal-${claimData.claim_id}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!claimData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">{t('qrModal.title')}</h2>
                <p className="text-white/90 text-sm">{t('qrModal.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <div className="bg-gray-50 p-4 rounded-lg inline-block">
              <img
                src={claimData.qr_code}
                alt="Deal QR Code"
                className="w-64 h-64 mx-auto"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
              >
                <Download className="w-4 h-4" />
                {t('qrModal.downloadCode')}
              </button>
            </div>
          </div>

          {/* Deal Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-3">{t('qrModal.dealDetails')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('qrModal.dealName')}</span>
                <span className="font-medium">{claimData.deal_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('qrModal.totalAmount')}</span>
                <span className="font-medium text-primary">{formatPrice(claimData.deal_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('qrModal.dealType')}</span>
                <span className="font-medium capitalize">{claimData.deal_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('qrModal.claimId')}</span>
                <span className="font-medium text-sm">{claimData.claim_id}</span>
              </div>
            </div>
          </div>

          {/* Validity Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{t('qrModal.expiresAt')}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(claimData.expires_at)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{t('qrModal.status')}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {t('qrModal.statusValue', { status: claimData.status })}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{t('qrModal.howToUse')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {(t('qrModal.instructions', { returnObjects: true }) || []).map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
          </div>

          {/* Verification URL */}
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Verification URL</h4>
            <div className="text-xs text-gray-600 bg-white p-2 rounded border break-all">
              {window.location.origin}/deal-validity?deal_id={claimData.deal_id}&customer_id={claimData.customer_id}&business_id={claimData.business_id}&group_id={claimData.group_id}
            </div>
          </div> */}
            {/* <p className="text-xs text-gray-500 mt-1">
              This URL will be used by the business to verify your deal
            </p> */}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {t('common.close')}
            </button>
            <button
              onClick={downloadQRCode}
              className="flex-1 bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('qrModal.download')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
