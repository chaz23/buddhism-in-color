# A script to create a dataset that contains most of the sutta-related segment-level data.

library(dplyr)
library(stringr)
library(tidyr)
library(purrr)
library(arrow)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/raw_sutta_data.Rda"
  )
)
load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/html/sutta_html.Rda"
  )
)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/sutta-hierarchy/sutta_hierarchy.Rda"
  )
)




# Take this part from https://github.com/chaz23/sutta-science/blob/main/data/sutta-translations/tidy-sutta-data.R ----

split_seg_id <- function (seg_id) {
  sutta <- str_extract(seg_id, "^.*(?=:)")
  
  num_id <- str_extract(seg_id, "(?<=:).*$")
  
  section_num <- num_id %>% str_extract("^.*(?=[.])")
  segment_num <- num_id %>% str_extract("(?=[0-9]+)[0-9]+$")
  
  paste(sutta, section_num, segment_num, sep = "|")
}


sutta_data <- raw_sutta_data %>%
  # Keep rows belonging to DN, MN, SN and AN.
  filter(grepl("(dn|mn|sn|an)[0-9]", segment_id)) %>%
  
  # Split segment_id into sutta, section number and segment number.
  mutate(segment_id_copy = map_chr(segment_id, split_seg_id)) %>%
  separate(
    segment_id_copy,
    into = c("sutta", "section_num", "segment_num"),
    sep = "[|]"
  ) %>%
  
  # Extract nikaya (collection) and sutta number.
  mutate(collection = str_extract(sutta, "[a-z]+"),
         sutta_num = str_remove(sutta, "[a-z]+"))




# Take this part from https://github.com/chaz23/sutta-science/blob/main/data/sutta-translations/tidy-kn-sutta-data.R ----

kn_sutta_data <- raw_sutta_data %>%
  # Keep rows belonging to KN.
  filter(!grepl("(dn|mn|sn|an)[0-9]", segment_id)) %>%
  
  # Extract sutta, section number and segment number.
  
  # KN segment numbering:
  
  # dhp: [sutta]:[segment_num]
  # Headings and subheadings of dhp have 0-th level numbering. (eg: 0.1)
  
  # All other texts follow [sutta]:[section_num].[segment_num]
  # Except for thag which has 2 segments with 0-th level segment numbers.
  
  mutate(
    sutta = str_extract(segment_id, "^.*(?=:)"),
    section_num = case_when(
      grepl("dhp", sutta) ~ str_extract(segment_id, "(?<=dhp).*(?=:)"),
      grepl("thag1.1:1.0.", segment_id) ~ "1",
      TRUE ~ str_extract(segment_id, "(?<=:).*(?=[.])")
    ),
    segment_num = case_when(
      grepl("dhp", sutta) ~ str_extract(segment_id, "(?<=:).*$"),
      grepl("thag1.1:1.0.", segment_id) ~ str_extract(segment_id, "0\\.[0-9]+$"),
      TRUE ~ str_extract(segment_id, "(?<=[:.])[0-9]+$")
    )
  ) %>%
  
  # Extract nikaya (collection) and sutta number.
  mutate(collection = str_extract(sutta, "[a-z]+"),
         sutta_num = str_remove(sutta, "[a-z]+"))




# Put it together. ----

# Because some suttas do not match values in the hierarchy dataset.
# Eg: an1.1 belongs under an1.1-10
sub_id_list <- sutta_hierarchy %>%
  filter(node_type == "leaf") %>%
  select(id) %>%
  filter(str_detect(id, "-")) %>%
  mutate(sub_ids = map(id, ~ {
    range <- str_extract(.x, "(?<=(\\.|dhp)).+(?<=[0-9])")
    range_start <- str_split(range, "-")[[1]][1]
    range_end <- str_split(range, "-")[[1]][2]
    sub_id_range <- as.numeric(range_start):as.numeric(range_end)
    base_string <- str_extract(.x, ".*(?<=(\\.|dhp))")
    sub_ids <- paste0(base_string, sub_id_range)
    tibble(sub_id = sub_ids)
  })) %>%
  unnest(cols = sub_ids)



out <- sutta_data %>%
  bind_rows(kn_sutta_data) %>%
  left_join(sutta_html, join_by(segment_id)) %>% 
  left_join(sutta_hierarchy %>% 
              select(id, node_type), 
            join_by(sutta == id)) %>%
  left_join(sub_id_list, join_by(sutta == sub_id)) %>% 
  mutate(hierarchy_id = case_when(is.na(node_type) ~ id,
                                  .default = sutta)) %>% 
  select(-id, -node_type)

temp_file <- tempfile(fileext = ".parquet")

write_parquet(out, sink = temp_file)

system2("cat", args = temp_file)
