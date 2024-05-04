library(dplyr)
library(DBI)
library(purrr)
library(jsonlite)
library(stringr)

source("./utils/r_utility_functions.R")

# Load translations.

load(url("https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_2/sutta_data.Rda"))
load(url("https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_3/kn_sutta_data.Rda"))


sutta_metadata <- sutta_data %>% 
  bind_rows(kn_sutta_data) %>%
  distinct(sutta)


# Add word count.

word_count <- sutta_data %>% 
  bind_rows(kn_sutta_data) %>% 
  mutate(words = str_count(segment_text, "\\W+")) %>% 
  group_by(sutta) %>% 
  summarise(words = sum(words, na.rm = TRUE))

sutta_metadata <- sutta_metadata %>% 
  left_join(word_count, by = "sutta")


# Add difficulties.

difficulties <- read_json("https://raw.githubusercontent.com/suttacentral/sc-data/main/additional-info/difficulties.json")
  

sutta_difficulties <- names(difficulties$dn) %>% 
  as_tibble() %>% 
  rename(sutta = value) %>% 
  mutate(difficulty = map_chr(sutta, ~ difficulties$dn[[.]])) %>% 
  bind_rows(
    names(difficulties$mn) %>% 
      as_tibble() %>% 
      rename(sutta = value) %>% 
      mutate(difficulty = map_chr(sutta, ~ difficulties$mn[[.]]))
  )

sutta_metadata <- sutta_metadata %>% 
  left_join(sutta_difficulties, by = "sutta")

# Write to SQL.

con <- connect_postgres()

sutta_metadata %>% 
  dbWriteTable(con, "sutta_metadata", ., overwrite = TRUE)
