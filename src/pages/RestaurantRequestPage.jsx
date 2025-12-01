import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { businessRequestAPI } from '../utils/api';
import { toast } from '../utils/toast';
import CommonLayout from '../components/layout/CommonLayout';
import jomfoodLogo from '../assets/JomFood.png';
import ScrollableSelect from '../components/ui/ScrollableSelect';

const RESTAURANT_TYPES = [
  'Fast Food',
  'Cafe',
  'Western',
  'Mamak',
  'Arabic',
  'Indian',
  'Local',
  'Chinese',
  'Korean',
  'Japanese',
  'Hotels',
  'Kitchen',
  'Pakistani',
  'Thai',
  'Cake & Bakery'
];

const initialForm = {
  name: '',
  type: '',
  address: {
    city: '',
    state: '',
    area: '',
    zip_code: ''
  },
  person_in_charge: {
    name: '',
    number: '',
    whatsapp: '',
    email: '',
    website: ''
  },
  socials: {
    facebook: '',
    instagram: '',
    tiktok: ''
  }
};

const RestaurantRequestPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('person_in_charge.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        person_in_charge: {
          ...prev.person_in_charge,
          [field]: value
        }
      }));
    } else if (name.startsWith('socials.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [field]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(t('restaurantRequest.validation.nameRequired'));
      return false;
    }
    if (!form.type) {
      toast.error(t('restaurantRequest.validation.typeRequired'));
      return false;
    }
    if (!form.address.city.trim()) {
      toast.error(t('restaurantRequest.validation.cityRequired'));
      return false;
    }
    if (!form.address.state.trim()) {
      toast.error(t('restaurantRequest.validation.stateRequired'));
      return false;
    }
    if (!form.address.area.trim()) {
      toast.error(t('restaurantRequest.validation.areaRequired'));
      return false;
    }
    if (!form.address.zip_code.trim()) {
      toast.error(t('restaurantRequest.validation.zipCodeRequired'));
      return false;
    }
    if (!form.person_in_charge.name.trim()) {
      toast.error(t('restaurantRequest.validation.contactNameRequired'));
      return false;
    }
    if (!form.person_in_charge.number.trim()) {
      toast.error(t('restaurantRequest.validation.phoneRequired'));
      return false;
    }
    if (!form.person_in_charge.whatsapp.trim()) {
      toast.error(t('restaurantRequest.validation.whatsappRequired'));
      return false;
    }
    if (!form.person_in_charge.email.trim()) {
      toast.error(t('restaurantRequest.validation.emailRequired'));
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.person_in_charge.email)) {
      toast.error(t('restaurantRequest.validation.emailInvalid'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Prepare payload - remove empty optional fields
      const payload = {
        name: form.name.trim(),
        type: form.type,
        address: {
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          area: form.address.area.trim(),
          zip_code: form.address.zip_code.trim()
        },
        person_in_charge: {
          name: form.person_in_charge.name.trim(),
          number: form.person_in_charge.number.trim(),
          whatsapp: form.person_in_charge.whatsapp.trim(),
          email: form.person_in_charge.email.trim()
        }
      };

      // Add optional fields only if they have values
      if (form.person_in_charge.website.trim()) {
        payload.person_in_charge.website = form.person_in_charge.website.trim();
      }

      const socials = {};
      if (form.socials.facebook.trim()) {
        socials.facebook = form.socials.facebook.trim();
      }
      if (form.socials.instagram.trim()) {
        socials.instagram = form.socials.instagram.trim();
      }
      if (form.socials.tiktok.trim()) {
        socials.tiktok = form.socials.tiktok.trim();
      }

      if (Object.keys(socials).length > 0) {
        payload.socials = socials;
      }

      const response = await businessRequestAPI.submitRequest(payload);
      
      if (response.success) {
        toast.success(t('restaurantRequest.submitSuccess'));
        // Reset form
        setForm(initialForm);
      } else {
        toast.error(response.message || t('restaurantRequest.submitError'));
      }
    } catch (err) {
      const message = err?.message || err?.data?.message || t('restaurantRequest.submitError');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommonLayout>
      <div className="min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={jomfoodLogo} alt="JomFood" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('restaurantRequest.title')}
            </h1>
            <p className="text-gray-600">
              {t('restaurantRequest.subtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('restaurantRequest.sections.restaurantInfo')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.restaurantName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.restaurantName')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.restaurantType')} <span className="text-red-500">*</span>
                    </label>
                    <ScrollableSelect
                      value={form.type}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                      options={RESTAURANT_TYPES.map((type) => ({
                        label: type,
                        value: type,
                      }))}
                      placeholder={t('restaurantRequest.placeholders.selectType')}
                      className="mt-1"
                      maxVisibleItems={4}
                      searchable
                      searchPlaceholder={t('restaurantRequest.placeholders.restaurantTypeSearch', 'Search restaurant type')}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('restaurantRequest.sections.address')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.city')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      value={form.address.city}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.city')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.state')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      value={form.address.state}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.state')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address.area" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.area')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address.area"
                      name="address.area"
                      type="text"
                      value={form.address.area}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.area')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address.zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.zipCode')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address.zip_code"
                      name="address.zip_code"
                      type="text"
                      value={form.address.zip_code}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.zipCode')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Person in Charge Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('restaurantRequest.sections.contactPerson')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="person_in_charge.name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.contactName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="person_in_charge.name"
                      name="person_in_charge.name"
                      type="text"
                      value={form.person_in_charge.name}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.contactName')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="person_in_charge.number" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('restaurantRequest.fields.phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="person_in_charge.number"
                        name="person_in_charge.number"
                        type="tel"
                        value={form.person_in_charge.number}
                        onChange={handleChange}
                        placeholder={t('restaurantRequest.placeholders.phone')}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="person_in_charge.whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('restaurantRequest.fields.whatsapp')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="person_in_charge.whatsapp"
                        name="person_in_charge.whatsapp"
                        type="tel"
                        value={form.person_in_charge.whatsapp}
                        onChange={handleChange}
                        placeholder={t('restaurantRequest.placeholders.whatsapp')}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="person_in_charge.email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('restaurantRequest.fields.email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="person_in_charge.email"
                        name="person_in_charge.email"
                        type="email"
                        value={form.person_in_charge.email}
                        onChange={handleChange}
                        placeholder={t('restaurantRequest.placeholders.email')}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="person_in_charge.website" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('restaurantRequest.fields.website')}
                      </label>
                      <input
                        id="person_in_charge.website"
                        name="person_in_charge.website"
                        type="url"
                        value={form.person_in_charge.website}
                        onChange={handleChange}
                        placeholder={t('restaurantRequest.placeholders.website')}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('restaurantRequest.sections.socialMedia')}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t('restaurantRequest.socialMediaNote')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="socials.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.facebook')}
                    </label>
                    <input
                      id="socials.facebook"
                      name="socials.facebook"
                      type="url"
                      value={form.socials.facebook}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.facebook')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="socials.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.instagram')}
                    </label>
                    <input
                      id="socials.instagram"
                      name="socials.instagram"
                      type="url"
                      value={form.socials.instagram}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.instagram')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="socials.tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('restaurantRequest.fields.tiktok')}
                    </label>
                    <input
                      id="socials.tiktok"
                      name="socials.tiktok"
                      type="url"
                      value={form.socials.tiktok}
                      onChange={handleChange}
                      placeholder={t('restaurantRequest.placeholders.tiktok')}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-medium transition-colors"
                >
                  {submitting ? t('restaurantRequest.submitting') : t('restaurantRequest.submitButton')}
                </button>
              </div>

              {/* Note */}
              <div className="text-sm text-gray-500 text-center">
                <p>{t('restaurantRequest.note')}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default RestaurantRequestPage;

