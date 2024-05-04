# Script to upload sutta translations to a SQL database. ------------------

library(dplyr)
library(DBI)

source("./utils/r_utility_functions.R")

# Load translations.

load(url("https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_2/sutta_data.Rda"))

# Write to SQL.

con <- connect_postgres()

sutta_data %>% 
  dbWriteTable(con, "tidy_sutta_translations", ., overwrite = TRUE)
