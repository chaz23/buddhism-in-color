library(dplyr)
library(purrr)
library(arrow)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/sutta-hierarchy/sutta_hierarchy.Rda"
  )
)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/vinaya-hierarchy/vinaya_hierarchy.Rda"
  )
)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/sutta-translations/sutta_data.Rda"
  )
)

load(
  url(
    "https://github.com/chaz23/sutta-science/raw/main/data/vinaya-translations/vinaya_data.Rda"
  )
)

sutta_data <- sutta_data %>%
  mutate(nikaya = "sutta")

vinaya_data <- vinaya_data %>%
  mutate(nikaya = "vinaya")

scripture_out <- sutta_data %>%
  bind_rows(vinaya_data)

sutta_hierarchy <- sutta_hierarchy %>%
  mutate(nikaya = "sutta")

vinaya_hierarchy <- vinaya_hierarchy %>%
  mutate(nikaya = "vinaya")

hierarchy_out <- sutta_hierarchy %>%
  bind_rows(vinaya_hierarchy)

words_per_min <- 200

reading_time <- scripture_out %>%
  mutate(num_words = map_dbl(segment_text, ~ lengths(strsplit(.x, "\\W+")))) %>%
  summarise(
    total_words = sum(num_words, na.rm = TRUE),
    reading_time = floor(total_words / words_per_min),
    .by = hierarchy_id
  ) %>%
  select(hierarchy_id, reading_time)

out <- hierarchy_out %>%
  left_join(reading_time, join_by(id == hierarchy_id))

temp_file <- tempfile(fileext = ".parquet")

write_parquet(out, sink = temp_file)
system2("cat", args = temp_file)
