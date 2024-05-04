# A script to create markdown files for visualising concept network graph in Obsidian. 

# Libraries. ----

library(dplyr)
library(vroom)
library(glue)
library(stringr)
library(purrr)
library(tidyr)




# Functions. ----

# Load the list of concepts.
concept_list <- vroom("./projects/concept-map/concept_list.csv",
                      col_types = "ccccc",
                      escape_backslash = TRUE,
                      altrep = FALSE)



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




# Write obsidian markdown files. ----

marked_down_data <- sutta_data %>% 
  create_internal_links(concept_list[1:92,]) %>% 
  group_by(sutta) %>% 
  nest() %>%
  ungroup()

for (i in 1:nrow(marked_down_data)) {
  marked_down_data[i,]$data[[1]] %>%
    pull(segment_text) %>%
    writeLines(glue("./projects/concept-map/obsidian-files/{marked_down_data[i,]$sutta[[1]]}.md"),
               useBytes = TRUE)
}