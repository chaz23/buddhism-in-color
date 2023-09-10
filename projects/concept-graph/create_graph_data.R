# A script to create `nodes` and `links` datasets to visualise the concept network graph. 

# Libraries. ----

library(dplyr)
library(vroom)
library(glue)
library(stringr)
library(stringi)
library(purrr)
library(tidyr)
library(tidytext)
library(jsonlite)




# Load data. ----

# List of concepts.
concept_list <- vroom("./projects/concept-map/concept_list.csv",
                      col_types = "ccccc",
                      escape_backslash = TRUE,
                      altrep = FALSE)


# Sutta data.
sutta_data <- c("dn", "mn", "sn", "an") %>% 
  map_dfr(~ {
    url <- glue("https://raw.githubusercontent.com/chaz23/sutta-science/main/data/sutta-translations/dataset_2/{.x}_sutta_data.tsv")
    
    vroom(url, col_types = c("cccddcdc"))
  }) %>% 
  bind_rows(
    glue("https://raw.githubusercontent.com/chaz23/sutta-science/main/data/sutta-translations/dataset_3/kn_sutta_data.tsv") %>% 
      vroom(col_types = c("cccddcdc"))
  )


# Distinct table of sutta and word.
# Unicode is escaped on segment_text so that words like Ājīvaka can be matched.
word_per_sutta <- sutta_data %>% 
  select(segment_text, sutta) %>% 
  mutate(segment_text = stri_escape_unicode(segment_text)) %>% 
  unnest_regex(word, segment_text, pattern = "(\\s+|[.?!,;:])", to_lower = FALSE) %>% 
  distinct(sutta, word) 


links <- word_per_sutta %>%
  cross_join(concept_list[1:92,] %>% 
               select(subject, regex)) %>% 
  filter(str_detect(word, regex)) %>% 
  distinct(sutta, subject) %>% 
  select(source = subject,
         target = sutta)


# Change group field later.
concept_nodes <- concept_list[1:92,] %>% 
  mutate(group = 1) %>% 
  select(id = subject, group)

sutta_nodes <- sutta_data %>% 
  distinct(sutta) %>% 
  select(id = sutta) %>% 
  mutate(group = 2)

nodes <- bind_rows(concept_nodes, sutta_nodes)
  



# Write JSON output files.

links %>% 
  write_json(path = "./projects/concept-map/graph-data/links.json", pretty = TRUE)

nodes %>% 
  write_json(path = "./projects/concept-map/graph-data/nodes.json", pretty = TRUE)
