# Writes to ./nextjs-app/app/lib/static-data

library(dplyr)
library(jsonlite)

# Load translations.

load(url("https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_2/sutta_data.Rda"))

# Write data.

sutta_data %>% 
  write_json("./nextjs-app/app/lib/static-data/tidy_sutta_data.json", pretty = TRUE)