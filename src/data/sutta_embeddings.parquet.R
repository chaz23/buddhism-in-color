library(dplyr)
library(arrow)
library(stringr)

load(url("https://github.com/chaz23/sutta-science/raw/main/data/text-embeddings/embeddings_by_section.Rda"))

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

hierarchy_id_lookup <- scripture_out %>%
    distinct(scripture, hierarchy_id)

embeddings_by_section <- embeddings_by_section %>%
    rename(scripture = sutta) %>%
    left_join(hierarchy_id_lookup, join_by(scripture))

temp_file <- tempfile(fileext = ".parquet")

write_parquet(embeddings_by_section, sink = temp_file)

system2("cat", args = temp_file)
