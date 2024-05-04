# Writes to ./nextjs-app/app/lib/static-data

library(dplyr)
library(stringr)
library(purrr)
library(jsonlite)
library(glue)


# Load blurbs.

texts <- c("dn", "mn", "an", "sn", "snp", "super", "iti", "kp", "ud")

blurbs_df <- texts %>% 
  map_dfr(~ {
    url_str <- glue("https://raw.githubusercontent.com/suttacentral/bilara-data/published/root/en/blurb/{.}-blurbs_root-en.json")
    
    blurbs <- read_json(url_str)
    
    names(blurbs) %>% 
      as_tibble() %>% 
      rename(blurb = value) %>% 
      mutate(desc = map_chr(blurb, ~ blurbs[[.]]))
  }) %>% 
  mutate(sutta = str_extract(blurb, "(?<=:).*$"))


# Load translations.

load(url("https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_2/sutta_data.Rda"))
load(url("https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_3/kn_sutta_data.Rda"))

sutta_hierarchy <- sutta_data %>% 
  bind_rows(kn_sutta_data) %>% 
  distinct(collection, sutta) %>% 
  mutate(chapter = str_split(sutta, pattern = "\\."),
         chapter = map_chr(chapter, ~ {
           if (length(.) == 2) .[1] else NA_character_
         })) %>% 
  left_join(blurbs_df %>% 
              select(-blurb, blurb = desc), 
            by = c("sutta"))


# Write to file.

sutta_hierarchy %>% 
  write_json("./nextjs-app/app/lib/static-data/sutta_hierarchy.json", pretty = TRUE)
