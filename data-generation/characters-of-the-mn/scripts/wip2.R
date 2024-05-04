library(dplyr)
library(readr)
library(tidyr)
library(jsonlite)
library(furrr)

plan(multisession)

# Load data ----

# Load sutta and vinaya data.

sutta_url <- "https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/dataset_2/sutta_data.Rda"
vinaya_url <- "https://github.com/chaz23/sutta-science/raw/main/data/vinaya-translations/dataset_2/vinaya_data.Rda"

load(url(sutta_url))
load(url(vinaya_url))

sutta_data <- sutta_data %>% 
  bind_rows(vinaya_data)

# Load MN characters dataset.

characters_url <- "https://raw.githubusercontent.com/chaz23/buddhism-in-color/main/projects/characters-of-the-mn/data/characters_of_the_mn.csv"

chars_data <- read_csv(characters_url)

# Load tidy DPPN.

load("./projects/characters-of-the-mn/data/compiled-persons-dppn.Rda")


# Match characters to suttas. ----

character_list <- chars_data %>% 
  select(character, id) %>%
  distinct(.keep_all = TRUE) %>% 
  left_join(select(sutta_characters, -character, -desc), by = "id") %>% 
  arrange(character)


characters_sutta_list <- character_list %>% 
  mutate(suttas = future_map(character, ~ {
    sutta_data %>% 
      filter(grepl(.x, segment_text)) %>% 
      select(sutta, segment_id, segment_text) %>% 
      group_by(sutta) %>% 
      slice_head(n = 10)
  })) %>% 
  unnest(cols = suttas)


write_json(characters_sutta_list, path = "./projects/characters-of-the-mn/data/characters_sutta_list.json", pretty = TRUE)

