export interface UserToken {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  granted_scopes: string[];
  access_token_stored_at: string;
  token_type?: string;
  [custom_param: string]: any;
}

export interface ClientToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
