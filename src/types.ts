export type MyBindings = {
  // aws
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  LAMBDA_URL?: string;

  // supabase
  SUPABASE_URL: string;
  SUPABASE_KEY: string;

  // db
  DATABASE_URL: string;
  HYPERDRIVE: {
    connectionString: string;
  };
};
