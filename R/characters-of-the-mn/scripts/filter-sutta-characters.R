# Script to clean pali proper names dictionary. ---------------------------

# The purpose of this script is to clean the suttacentral pali proper names dictionary so that the entries are useable for this project.

# Steps. ----

# Download the pali proper names dictionary from suttacentral by pasting this link into the browser:
# https://raw.githubusercontent.com/suttacentral/sc-data/master/dictionaries/complex/en/pli2en_dppn.json

# Save it in "./R/characters-of-the-mn/data/original-pali-proper-names-dict.json"

# Load the dictionary.
# Convert to tibble.
# Keep only the entries that include people.
# Extract IDs and descriptions from entries.
# Replace PTS references with sutta numbers.

# Fix errors:


# Begin script. ----


library(dplyr)
library(tidyr)
library(httr)
library(purrr)
library(stringi)
library(readr)
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


data_path <- "./R/characters-of-the-mn/data/original-pali-proper-names-dict.json"
 
sutta_proper_names <- read_json(data_path) %>% 
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
  # Keep items that include people.
  filter(grepl("class='person'", text)) %>%
  
  # Remove entries of places.
  mutate(text = case_when(grepl("<dl class='person'", text) ~ 
                            sub(regex$starts_with_person, "", text, perl = TRUE),
                          grepl("<dl class='place'", text) ~ 
                            sub(regex$starts_with_place, "<dl class='person'>", text, perl = TRUE),
                          TRUE ~ text)) %>% 
  
  # Parse text field.
  mutate(text = map2(word, text, parse_text)) %>% View()
  unnest(cols = text) %>% 
  
  # Transliterate character name.
  mutate(word_trans = stri_trans_general(word, "latin-ascii"))



# save(sutta_characters, file = "./R/characters-of-the-mn/data/sutta_characters.Rda")










# save(sutta_characters, file = "./data/dataset_6/sutta_characters.Rda")
# write_tsv(sutta_characters, "./data/dataset_4/sutta_characters.tsv")


# GET("https://api.pts.dhamma-dana.de/v1/lookup/sn/0/123.json") %>% 
#   content(as = "parsed", type = "application/json")
# 
# 
# "<dd><p>One of the ten ancient seers who conducted great sacrifices and were versed in Vedic lore. The others being Aṭṭhaka, Vāmaka, Vāmadeva, Vessāmitta, Yamataggi, Bhāradvāja, Vāseṭṭha, Kassapa and Bhagu. The list occurs in several places. <span class='ref'>Vin.i.245</span> <span class='ref'>AN.iii.224</span> <span class='ref'>MN.ii.169</span> <span class='ref'>MN.ii.200</span></p><p>The same ten are also mentioned as being composers and reciters of the Vedas. <span class='ref'>DN.i.238</span></p></dd>" %>% regmatches(., gregexec("(?<=class='ref'>)(?:.*?)(?=</span>)", ., perl = TRUE)) %>% unlist() %>% as_tibble()

# translate_pts_refs <- function (pts_ref) {
#   refs <- pts_ref %>% 
#     regmatches(., gregexec("(?<=class='ref'>)(?:.*?)(?=</span>)", ., perl = TRUE)) %>% 
#     unlist() %>% 
#     as_tibble()
#   
#   refs %>% 
#     rename(pts_ref = value) %>% 
#     mutate(seg_id = map_chr(pts_ref, ~ sub("(?=(<em|f|;|-|\U{2013})).*$", "", ., perl = TRUE)))
# }
# 
# test <- sutta_characters %>% 
#   mutate(refs = map(desc, translate_pts_refs)) %>% 
#   unnest(cols = refs)
#   # filter(!grepl("^(MN|SN|DN|AN|Vin|Thag|Thig|Snp|Ud|It|Dhp|Aii|A.i)", value))
# 
# test %>% 
#   mutate(test = stringr::str_split(seg_id, "\\."),
#          test = map_dbl(test, length)) %>% 
#   filter(grepl("^(SN|DN|MN|AN)", seg_id)) %>% View()
#   filter(test != 3)

# sutta_proper_names %>% 
#   mutate(row_num = row_number()) %>% 
#   filter(grepl("class='person'", text)) %>%
#   mutate(dd_count = map_dbl(text, ~ length(pluck(gregexpr("<dd ?", .), 1))),
#          dt_count = map_dbl(text, ~ length(pluck(gregexpr("<dt ?", .), 1))),
#          dl_count = map_dbl(text, ~ length(pluck(gregexpr("<dl ?", .), 1))),
#          dfn_count = map_dbl(text, ~ length(pluck(gregexpr("<dfn ?", .), 1))),
#          p_count = map_dbl(text, ~ length(pluck(gregexpr("<p ?", .), 1)))) %>%
#   filter(dd_count != dfn_count) %>% 
#   filter(grepl("class='place'", text)) %>% 
# filter(grepl("<dl class='person'", text)) %>% 
# mutate(text = sub("(?=<dt class='place').*?(?=<dt class='person'|</dl>)", "", text, perl = TRUE))


# readr::write_tsv(sutta_characters, "./sutta-characters.tsv")

# "DN.i.85–86" %>% sub("(?=(<em|f|;|-|\U{2013})).*$", "", ., perl = TRUE)


# MN: MN86
# SN: SN.348-352, SN.163
# Thag: Everything except "Thag.776."
