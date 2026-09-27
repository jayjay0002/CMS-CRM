ADMIN_NAME_MAX_LENGTH = 120

# Checked before sending a new password to Supabase.
MIN_PASSWORD_LENGTH = 10
MAX_PASSWORD_LENGTH = 128

JWKS_PATH = "/auth/v1/.well-known/jwks.json"
AUTH_ISSUER_PATH = "/auth/v1"
ADMIN_USERS_PATH = "/auth/v1/admin/users"
# Supabase signs access tokens with asymmetric JWT signing keys.
ALLOWED_JWT_ALGORITHMS = ("ES256", "RS256")
# Signing keys rarely rotate; refetch the key set at most this often.
JWKS_CACHE_SECONDS = 600
SUPABASE_REQUEST_TIMEOUT_SECONDS = 10
