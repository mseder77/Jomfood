import { supabase } from './supabase';

export const dealsAPI = {
  getActiveDeals: async (queryString = '') => {
    const params = new URLSearchParams(queryString);

    let query = supabase
      .from('deals')
      .select(`
        *,
        business_id:businesses!inner(*),
        group_id:business_groups(*),
        deal_category_id:deal_categories(*),
        deal_items(
          *,
          product_id:products(*)
        )
      `)
      .eq('is_active', true)
      .eq('status', 'active');

    if (params.get('category_id')) {
      query = query.eq('deal_category_id', params.get('category_id'));
    }

    if (params.get('text_search')) {
      const search = `%${params.get('text_search')}%`;
      query = query.or(`deal_name.ilike.${search},deal_description.ilike.${search}`);
    }

    if (params.get('min_price')) {
      query = query.gte('deal_total', parseFloat(params.get('min_price')));
    }

    if (params.get('max_price')) {
      query = query.lte('deal_total', parseFloat(params.get('max_price')));
    }

    if (params.get('min_discount')) {
      query = query.gte('discount_percentage', parseFloat(params.get('min_discount')));
    }

    if (params.get('max_discount')) {
      query = query.lte('discount_percentage', parseFloat(params.get('max_discount')));
    }

    if (params.get('tags')) {
      const tags = params.get('tags').split(',');
      query = query.overlaps('tags', tags);
    }

    const sortBy = params.get('sort_by') || 'newest';
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('deal_total', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('deal_total', { ascending: false });
    } else if (sortBy === 'discount_high') {
      query = query.order('discount_percentage', { ascending: false });
    }

    const page = parseInt(params.get('page')) || 1;
    const limit = parseInt(params.get('limit')) || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalDeals = count || data?.length || 0;
    const totalPages = Math.ceil(totalDeals / limit);

    return {
      success: true,
      data: {
        deals: data || [],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_deals: totalDeals,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      }
    };
  },

  getDealById: async (id) => {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        business_id:businesses(*),
        group_id:business_groups(*),
        deal_category_id:deal_categories(*),
        deal_items(
          *,
          product_id:products(*)
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  },

  claimDeal: async (dealId, customerId) => {
    const claimCode = `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const deal = await supabase
      .from('deals')
      .select('business_id, group_id')
      .eq('id', dealId)
      .maybeSingle();

    if (deal.error) throw deal.error;

    const { data, error } = await supabase
      .from('deal_claims')
      .insert({
        deal_id: dealId,
        customer_id: customerId,
        business_id: deal.data.business_id,
        group_id: deal.data.group_id,
        claim_code: claimCode
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  },

  getAllTags: async () => {
    const { data, error } = await supabase
      .from('deals')
      .select('tags')
      .eq('is_active', true);

    if (error) throw error;

    const allTags = new Set();
    data?.forEach(deal => {
      deal.tags?.forEach(tag => allTags.add(tag));
    });

    return {
      success: true,
      data: Array.from(allTags)
    };
  }
};

export const categoriesAPI = {
  getCategories: async (params = {}) => {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  },

  getCategory: async (id) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  }
};

export const dealCategoriesAPI = {
  getActiveDealCategories: async (params = {}) => {
    let query = supabase
      .from('deal_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  }
};

export const restaurantsAPI = {
  getRestaurants: async (params = {}) => {
    let query = supabase
      .from('businesses')
      .select('*')
      .order('company_name', { ascending: true });

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      pagination: {
        current_page: page,
        total_pages: Math.ceil((data?.length || 0) / limit),
        has_next: data?.length === limit,
        has_prev: page > 1
      }
    };
  },

  getRestaurantsByCategory: async (categoryId, params = {}) => {
    return restaurantsAPI.getRestaurants(params);
  },

  getRestaurant: async (id) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  }
};

export const dealValidityAPI = {
  verifyDeal: async (claimId, dealId, customerId, businessId, groupId) => {
    const { data, error } = await supabase
      .from('deal_claims')
      .select(`
        *,
        deal_id:deals(*),
        business_id:businesses(*)
      `)
      .eq('id', claimId)
      .eq('deal_id', dealId)
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .eq('group_id', groupId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        success: false,
        message: 'Invalid claim'
      };
    }

    if (data.is_used) {
      return {
        success: false,
        message: 'Deal already used'
      };
    }

    if (data.is_rejected) {
      return {
        success: false,
        message: 'Deal was rejected'
      };
    }

    return {
      success: true,
      data: data
    };
  },

  markDealAsUsed: async (dealId, customerId, businessId, claimId) => {
    const { data, error } = await supabase
      .from('deal_claims')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .eq('deal_id', dealId)
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  },

  rejectDeal: async (dealId, customerId, businessId, claimId, reason) => {
    const { data, error } = await supabase
      .from('deal_claims')
      .update({
        is_rejected: true,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .eq('deal_id', dealId)
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  }
};

export const googleOAuthAPI = {
  authenticate: async (userInfo) => {
    return {
      success: true,
      data: {
        customer_id: userInfo.email,
        ...userInfo
      }
    };
  }
};
