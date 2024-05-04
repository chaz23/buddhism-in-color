# Compile person entries from pali dictionary. ----------------------------

# The purpose of this script is to extract person entries from the suttacentral pali proper names dictionary and compile them in a person-per-row tidy format.

# If the dictionary does not assign an ID to a person, the ID will be that persons name (i.e id = character).


library(dplyr)
library(tidyr)
library(httr)
library(purrr)
library(stringi)
library(jsonlite)
library(snakecase)


data_path <- "./projects/sutta-characters/data/pli2en_dppn_original.json"

sutta_proper_names <- fromJSON(data_path) %>% 
  as_tibble()

regex <- list(starts_with_person = "(?=<dt class='place').*?(?=<dt class='person'|</dl>)",
              starts_with_place = "<dl class='place'.*(?=<dt class='person')")


parse_text <- function (word, text) {
  regexs <- list(id = "(?<=<dfn)(?:.*?)(?=</dfn>)",
                 desc = "(?:<dd>.*?</dd>)")
  
  ids <- text %>%
    regmatches(., gregexec(regexs$id, ., perl = TRUE)) %>%
    unlist() %>% 
    (function (x) {
      case_when(grepl("id='", x) ~ sub("'>.*$", "", sub("^.*id='", "", x)),
                TRUE ~ sub(">", "", x))
    })
  
  descs <- text %>%
    regmatches(., gregexec(regexs$desc, ., perl = TRUE)) %>%
    unlist()
  
  tibble(id = ids, desc = descs)
}


sutta_characters <- sutta_proper_names %>% 
  rename(character = word) %>% 
  
  # Keep items that include people.
  filter(grepl("class='person'", text)) %>%
  
  # Remove entries of places.
  mutate(text = case_when(grepl("<dl class='person'", text) ~ 
                            sub(regex$starts_with_person, "", text, perl = TRUE),
                          grepl("<dl class='place'", text) ~ 
                            sub(regex$starts_with_place, "<dl class='person'>", text, perl = TRUE),
                          TRUE ~ text)) %>% 
  
  # Parse text field.
  mutate(text = map2(character, text, parse_text)) %>% 
  unnest(cols = text) %>% 
  mutate(character = to_sentence_case(character)) %>% 
  arrange(character)


# Save data.

write_json(sutta_characters, 
           path = "./projects/sutta-characters/data/pli2en_dppn_tidied.json",
           pretty = TRUE)
