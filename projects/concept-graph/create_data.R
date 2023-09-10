# Libraries. ----

library(dplyr)
library(vroom)
library(glue)
library(stringr)
library(purrr)
library(tidyr)
library(readxl)




# Functions. ----

# Load the list of concepts.
load_concept_list <- function() {
  concept_list <<- vroom("./projects/concept-map/concept_list.csv",
                         col_types = "ccccc",
                         escape_backslash = TRUE,
                         altrep = FALSE)
  # concept_list <<- read_excel("./projects/concept-map/concept_list.xlsx")
}



# Function to create internal links for the specified string.
create_internal_links <- function(data, concept_list) {
  
  # Create internal links for each concept.
  concepts <- concept_list %>% 
    pull(regex)
  
  replacements <- concept_list %>% 
    pull(subject)
  
  
  for (i in 1:length(concepts)) {
    replacement_text <- glue("[[{concept_list[i,]$subject}]]")
    data <- data %>% 
      mutate(segment_text = str_replace_all(string = segment_text,
                                            pattern = concepts[i], 
                                            replacement = replacement_text))
  }
  
  data
}


# List all suttas that contain the search string.
# This is given by `index` - i.e the row number of the concept list file.
# `index` can also be a search string itself - useful for quick exploration.
list_suttas_by_index <- function(data, index) {
  if (is.numeric(index)) {
    concept <- concept_list[index,]$subject
    concept_regex <- concept_list[index,]$regex
  } else {
    concept <- index
    concept_regex <- index
  }
  
  print(glue("Concept is `{concept}` and regex is `{concept_regex}`."))
  
  data %>% 
    mutate(num_occurences = str_count(segment_text, regex(concept_regex, ignore_case = TRUE))) %>%
    pull(num_occurences) %>% 
    sum(na.rm = TRUE) %>% 
    (function (x) {
      print(glue("{x} occurences of {concept}.\n"))
    })
  
  data %>% 
    filter(str_detect(segment_text, regex(concept_regex, ignore_case = TRUE))) %>% 
    distinct(sutta) %>% 
    nrow() %>% 
    (function (x) {
      print(glue("{x} suttas with {concept}.\n"))
    })
  
  data %>% 
    filter(str_detect(segment_text, regex(concept_regex, ignore_case = TRUE))) %>% 
    select(segment_id, segment_text)
}




# Load data. ----

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



# List of concepts.
load_concept_list()




# Exploration. ----

# For each concept, check how many times they appear in the suttas.
# This will identify which words have been translated differently by BS.

occurences <- concept_list %>% 
  mutate(num_occurences = map_dbl(regex, ~ {
    sutta_data %>% 
      filter(collection == "mn") %>% 
      filter(str_detect(segment_text, .x)) %>% 
      nrow()
  })) %>% 
  mutate(num_sutta = map_dbl(regex, ~ {
    sutta_data %>% 
      filter(collection == "mn") %>% 
      filter(str_detect(segment_text, .x)) %>% 
      distinct(sutta) %>% 
      nrow()
  }))

sutta_data %>% 
  filter(str_detect(segment_text, "the all"))

concept_list %>% 
  filter(str_detect(subject, "abode"))

load_concept_list()

sutta_data %>% 
  list_suttas_by_index(114) 
  filter(!str_detect(segment_text, "(awakened Buddha|perfected and fully awakened)")) 


# "right action" %>% grepl("(?<!right )action", ., perl = TRUE)

  
# Write obsidian markdown files. ----
  
marked_down_data <- sutta_data %>% 
  create_internal_links(concept_list[1:92,]) %>% 
  group_by(sutta) %>% 
  nest() %>%
  ungroup()
  
for (i in 1:nrow(marked_down_data)) {
  marked_down_data[i,]$data[[1]] %>%
    pull(segment_text) %>%
    writeLines(glue("./projects/concept-map/obsidian-files/{marked_down_data[i,]$sutta[[1]]}.md"), useBytes = TRUE)
}


sutta_data %>% 
  filter(sutta == "mn83")