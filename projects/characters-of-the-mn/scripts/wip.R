library(dplyr)
library(readr)
library(purrr)
library(tidyr)
library(furrr)
library(jsonlite)

plan(multisession)

sutta_trans_url <- "https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_2/sutta_data.Rda"
kn_sutta_trans_url <- "https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_3/kn_sutta_data.Rda"
vinaya_trans_url <- "https://github.com/chaz23/sutta-science/raw/main/data/vinaya-translations/dataset_2/vinaya_data.Rda"
characters_url <- "https://raw.githubusercontent.com/chaz23/sutta-science/main/data/pali-proper-names/dataset_1/characters_of_the_mn.csv"

load(url(sutta_trans_url))
load(url(vinaya_trans_url))
load("./R/characters-of-the-mn/data/sutta_characters.Rda")

chars_data <- read_csv(characters_url)

sutta_data <- sutta_data %>% 
  mutate(text_type = "sutta")

vinaya_data <- vinaya_data %>% 
  mutate(text_type = "vinaya")

data <- sutta_data %>% bind_rows(vinaya_data)

sutta_list <- chars_data %>% 
  select(character, character_id) %>%
  distinct(.keep_all = TRUE) %>% 
  mutate(sutta_list = future_map(character, ~ {
    data %>% 
      filter(grepl(paste0("\\b", .x, "\\b"), segment_text)) %>%
      select(sutta, segment_id, text_type) %>% 
      group_by(sutta) %>% 
      slice_head(n = 1) %>% 
      ungroup()
  })) %>% 
  left_join(select(sutta_characters, id, desc), by = c("character_id" = "id")) %>% 
  unnest(cols = sutta_list)

write_json(sutta_list, path = "./R/characters-of-the-mn/data/characters_sutta_list.json", pretty = TRUE)

