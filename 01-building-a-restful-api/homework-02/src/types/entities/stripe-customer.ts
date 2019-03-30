interface StripeCustomer {
  id: string;
  object: string;
  account_balance: number;
  created: number;
  currency: string;
  default_source?: string;
  delinquent: boolean;
  description?: string;
  discount?: number;
  email?: string;
  invoice_prefix: string;
  invoice_settings: {
    custom_fields?: string[];
    footer?: string;
  };
  livemode: boolean;
  metadata: object;
  shipping?: string;
  sources: {
    object: string;
    data: any[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  subscriptions: {
    object: string;
    data: any[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  tax_info?: string;
  tax_info_verification?: string;
}

export {StripeCustomer};
