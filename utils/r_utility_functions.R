# Utility functions for use with R. ---------------------------------------


connect_postgres <- function() {
  DBI::dbConnect(odbc::odbc(),
                 Driver   = "PostgreSQL Unicode",
                 Server   = keyring::key_get("vercel-postgres-server"),
                 Database = keyring::key_get("vercel-postgres-db"),
                 UID      = keyring::key_get("vercel-postgres-uid"),
                 PWD      = keyring::key_get("vercel-postgres-pwd"),
                 sslmode = "require")
}


