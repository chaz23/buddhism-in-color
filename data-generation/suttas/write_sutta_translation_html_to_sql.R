# Script to upload sutta translations to a SQL database. ------------------

library(dplyr)
library(DBI)

source("./utils/r_utility_functions.R")

# Load translations.

load(url("https://github.com/chaz23/sutta-science/raw/main/data/html/dataset_1/sutta_html.Rda"))

# Write to SQL.

con <- connect_postgres()

class(sutta_html) <- class(sutta_html)[!class(sutta_html) %in% "spec_tbl_df"]

sutta_html %>% 
  dbWriteTable(con, "sutta_html", ., overwrite = TRUE)
