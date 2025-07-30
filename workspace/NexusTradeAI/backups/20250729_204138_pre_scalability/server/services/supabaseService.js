const { createClient } = require('@supabase/supabase-js');
const config = require('../utils/config');

let supabase = null;

// Only initialize Supabase if credentials are provided and valid
if (config.SUPABASE_URL && config.SUPABASE_SERVICE_KEY && 
    config.SUPABASE_URL !== 'placeholder' && config.SUPABASE_URL !== '') {
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
}

class SupabaseService {
  static async insertSignal(userId, strategy, signal, confidence) {
    if (!supabase) {
      console.error('Supabase not configured, cannot insert signal.');
      return [];
    }

    const { data, error } = await supabase
      .from('signals')
      .insert([{ user_id: userId, strategy, signal, confidence }]);
    if (error) throw error;
    return data;
  }

  static async getLatestSignals(userId, limit = 10) {
    if (!supabase) {
      console.error('Supabase not configured, cannot get signals.');
      return [];
    }

    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  static async getPortfolio(userId) {
    if (!supabase) {
      console.error('Supabase not configured, cannot get portfolio.');
      return { pnl: 0, sharpe_ratio: 0, position_count: 0 };
    }

    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  static async updatePortfolio(userId, pnl, sharpe_ratio) {
    if (!supabase) {
      return { user_id: userId, pnl, sharpe_ratio, last_updated: new Date() };
    }

    const { data, error } = await supabase
      .from('portfolio')
      .upsert({ user_id: userId, pnl, sharpe_ratio, last_updated: new Date() });
    if (error) throw error;
    return data;
  }

  static async updateSubscription(userId, stripe_customer_id, stripe_status) {
    if (!supabase) {
      return { user_id: userId, stripe_customer_id, stripe_status };
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({ user_id: userId, stripe_customer_id, stripe_status });
    if (error) throw error;
    return data;
  }

  static async getSubscription(userId) {
    if (!supabase) {
      return {
        user_id: userId,
        stripe_customer_id: 'demo_customer',
        stripe_status: 'active',
        created_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  static async getRecentTrades(userId, limit = 10) {
    if (!supabase) {
      console.error('Supabase not configured, cannot get recent trades.');
      return [];
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }
}

module.exports = SupabaseService; 