# Compile person entries from pali dictionary. ----------------------------

# The purpose of this script is to extract person entries from the suttacentral pali proper names dictionary and compile them in a person-per-row tidy format.

# If the dictionary does not assign an ID to a person, the ID will be that persons name (i.e id = character).


library(dplyr)
library(tidyr)
library(httr)
library(purrr)
library(stringi)
library(jsonlite)

# Errors: 
# Sundarika - class=person - its a river.
# id Revata1 and Revata2 are the same person?
# Bhagu, atthaka have two entries with the same ID
# MN116 make sure I've got the pacceka buddhas correctly
# Check that I've got the entries of mara and brahma correct
# Should I put the names of the people whose monastery it was (eg Anathapindikas monastery)
# Should I include suddhodhana and migaras mother
# Add entries for the classes of devas


data_path <- "https://raw.githubusercontent.com/suttacentral/sc-data/master/dictionaries/complex/en/pli2en_dppn.json"

sutta_proper_names <- GET(data_path) %>% 
  content(as = "parsed", type = "application/json") %>% 
  lapply(function (x) as_tibble(x)) %>% 
  do.call("bind_rows", .)


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
  
  # Transliterate character name.
  mutate(character_trans = stri_trans_general(character, "latin-ascii"))


save(sutta_characters, file = "./R/characters-of-the-mn/data/compiled-persons-dppn.Rda")

