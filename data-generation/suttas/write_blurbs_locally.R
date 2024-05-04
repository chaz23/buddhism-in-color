# Writes to ./nextjs-app/app/lib/static-data

library(dplyr)
library(purrr)
library(jsonlite)
library(glue)

# Load translations.

texts <- c("dn", "mn", "an", "sn", "snp", "super", "iti", "kp", "ud")

blurbs_df <- texts %>% 
  map_dfr(~ {
    url_str <- glue("https://raw.githubusercontent.com/suttacentral/bilara-data/published/root/en/blurb/{.}-blurbs_root-en.json")
    
    blurbs <- read_json(url_str)
    
    names(blurbs) %>% 
      as_tibble() %>% 
      rename(blurb = value) %>% 
      mutate(desc = map_chr(blurb, ~ blurbs[[.]]))
  })

blurbs_df %>% 
  write_json("./nextjs-app/app/lib/static-data/blurbs.json", pretty = TRUE)