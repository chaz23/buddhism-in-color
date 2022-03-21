library(dplyr)
library(readr)
library(jsonlite)

# TO-DO:

# Strip whitespace from IDs


characters_url <- "https://raw.githubusercontent.com/chaz23/sutta-science/main/data/pali-proper-names/dataset_1/characters_of_the_mn.csv"

load("./R/characters-of-the-mn/data/compiled-persons-dppn.Rda")

chars_data <- read_csv(characters_url)

sutta_list <- chars_data %>% 
  select(character, character_id) %>%
  distinct(.keep_all = TRUE) %>% 
  left_join(select(sutta_characters, -character), by = c("character_id" = "id")) %>% 
  arrange(character)

# write_json(sutta_list, path = "./R/characters-of-the-mn/data/characters_sutta_list.json", pretty = TRUE)

